import { ARCHETYPES, ARCHETYPE_ORDER } from '../data/archetypes';
import { productForArchetype, type ArchetypeId } from '../data/products';
import {
  QUESTIONS,
  visibleQuestions,
  type Answer,
  type Answers,
  type ProfileKey,
  type Question,
  type QuestionGroup,
  type QuestionId,
  type Scores,
} from '../data/quiz';

/*
 * Regelbasierte, nachvollziehbare Ergebnislogik (Businessplan Kapitel 5).
 * Keine KI, kein Zufall: dieselben Antworten ergeben immer dasselbe Ergebnis.
 */

export type Fit = 'clear' | 'good' | 'orientation' | 'compromise';

export interface ScoreRow {
  question: Question;
  answers: Answer[];
  points: Scores;
}

export interface RankedScent {
  id: ArchetypeId;
  total: number;
  /** Mindestens eine ausdrücklich gemiedene Duftrichtung trifft auf diesen Duft zu */
  hard: boolean;
  byGroup: Record<QuestionGroup, number>;
}

export interface Reason {
  signal: string;
  text: string;
}

export interface Recommendation {
  productSlug: string;
  variantId?: string;
  kind: 'parfum' | 'discovery' | 'gift';
}

export type Profile = Record<ProfileKey | 'intensity', number>;

export interface MatchResult {
  ranking: RankedScent[];
  primary: ArchetypeId;
  alternative: ArchetypeId | null;
  fit: Fit;
  rows: ScoreRow[];
  reasons: Reason[];
  exclusionNotes: string[];
  /** Der Duft, auf den deine Vorlieben eigentlich zeigen, den du aber ausgeschlossen hast */
  blocked: { id: ArchetypeId; signals: string[] } | null;
  profile: Profile;
  recommendation: Recommendation;
}

/** Abstand, ab dem zwei Düfte als „ähnlich gut passend“ gelten (5.4). */
const TIE_THRESHOLD = 1;
const GROUP_PRIORITY: QuestionGroup[] = ['notes', 'context', 'mood', 'purpose', 'aesthetic', 'exclusion'];

const zero = (): Scores => ({ glow: 0, muse: 0, afterglow: 0 });
const emptyGroups = (): Record<QuestionGroup, number> => ({
  notes: 0,
  exclusion: 0,
  context: 0,
  mood: 0,
  aesthetic: 0,
  purpose: 0,
});
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function pickedAnswers(question: Question, answers: Answers): Answer[] {
  const ids = answers[question.id] ?? [];
  return question.answers.filter((a) => ids.includes(a.id));
}

/** Tie-Breaker nach 5.4: direkte Duftnoten, dann Ausschlüsse, dann Intensität und Anlass. */
function tieBreak(a: RankedScent, b: RankedScent): number {
  return (
    b.byGroup.notes - a.byGroup.notes ||
    b.byGroup.exclusion - a.byGroup.exclusion ||
    b.byGroup.context - a.byGroup.context
  );
}

export function computeMatch(answers: Answers): MatchResult {
  const rows: ScoreRow[] = [];
  const totals = zero();
  const byGroup: Record<ArchetypeId, Record<QuestionGroup, number>> = {
    glow: emptyGroups(),
    muse: emptyGroups(),
    afterglow: emptyGroups(),
  };
  const hardSignals: Record<ArchetypeId, string[]> = { glow: [], muse: [], afterglow: [] };
  const profileRaw: Record<ProfileKey, number> = { fresh: 0, floral: 0, sweet: 0, warm: 0, woody: 0 };
  const contributions: { question: Question; answer: Answer; id: ArchetypeId; points: number }[] = [];
  const exclusionNotes: string[] = [];
  let intensity = 3;
  let intensityShift = 0;

  for (const question of visibleQuestions(answers)) {
    const picked = pickedAnswers(question, answers);
    if (picked.length === 0) continue;

    const points = zero();
    for (const answer of picked) {
      for (const id of ARCHETYPE_ORDER) {
        const value = (answer.scores?.[id] ?? 0) + (answer.exclusion?.penalties[id] ?? 0);
        if (value !== 0) {
          points[id] += value;
          contributions.push({ question, answer, id, points: value });
        }
      }
      if (answer.exclusion) {
        answer.exclusion.hard?.forEach((id) => hardSignals[id].push(answer.description));
        exclusionNotes.push(answer.exclusion.explain);
      }
      for (const [key, value] of Object.entries(answer.profile ?? {}) as [ProfileKey, number][]) {
        profileRaw[key] += value;
      }
      if (answer.intensity !== undefined) intensity = answer.intensity;
      intensityShift += answer.intensityShift ?? 0;
    }

    for (const id of ARCHETYPE_ORDER) {
      totals[id] += points[id];
      byGroup[id][question.group] += points[id];
    }
    rows.push({ question, answers: picked, points });
  }

  const ranking: RankedScent[] = ARCHETYPE_ORDER.map((id) => ({
    id,
    total: totals[id],
    hard: hardSignals[id].length > 0,
    byGroup: byGroup[id],
  }));

  // Ausgeschlossene Düfte nach Möglichkeit nicht empfehlen, danach nach Punkten.
  ranking.sort(
    (a, b) =>
      Number(a.hard) - Number(b.hard) ||
      b.total - a.total ||
      ARCHETYPE_ORDER.indexOf(a.id) - ARCHETYPE_ORDER.indexOf(b.id),
  );
  for (const i of [0, 1]) {
    const a = ranking[i];
    const b = ranking[i + 1];
    if (a.hard === b.hard && Math.abs(a.total - b.total) <= TIE_THRESHOLD && tieBreak(a, b) > 0) {
      ranking[i] = b;
      ranking[i + 1] = a;
    }
  }

  const [first, second] = ranking;
  const primary = first.id;

  const rawTop = [...ranking].sort((a, b) => b.total - a.total)[0];
  const blocked =
    rawTop.hard && rawTop.id !== primary && rawTop.total - first.total >= 3
      ? { id: rawTop.id, signals: hardSignals[rawTop.id] }
      : null;

  const families = answers.families ?? [];
  const unsureFamilies = families.length === 0 || families.includes('not-sure');
  const positive = ranking.reduce((sum, r) => sum + Math.max(0, r.total), 0);
  const share = positive > 0 ? Math.max(0, first.total) / positive : 0;
  const margin = first.total - second.total;

  let fit: Fit;
  if (blocked) fit = 'compromise';
  else if (unsureFamilies || first.total <= 4) fit = 'orientation';
  else if (share >= 0.45 && margin >= 4) fit = 'clear';
  else fit = 'good';

  const alternative = !second.hard && (fit !== 'clear' || margin <= 5) ? second.id : null;

  // Begründung: die stärksten positiven Signale für den empfohlenen Duft.
  const archetype = ARCHETYPES[primary];
  const usedTags = new Set<string>();
  const reasons: Reason[] = [];
  const candidates = contributions
    .filter((c) => c.id === primary && c.points > 0)
    .sort(
      (x, y) =>
        y.points - x.points || GROUP_PRIORITY.indexOf(x.question.group) - GROUP_PRIORITY.indexOf(y.question.group),
    );
  for (const c of candidates) {
    const tag = c.answer.tags?.find((t) => archetype.reasons[t] && !usedTags.has(t));
    if (!tag) continue;
    usedTags.add(tag);
    reasons.push({ signal: c.answer.label, text: archetype.reasons[tag] as string });
    if (reasons.length === 3) break;
  }
  if (reasons.length === 0) reasons.push({ signal: 'Deine Angaben', text: archetype.fallbackReason });

  const level = (raw: number) => clamp(Math.round(1 + (raw * 4) / 6), 1, 5);
  const profile: Profile = {
    fresh: level(profileRaw.fresh),
    floral: level(profileRaw.floral),
    sweet: level(profileRaw.sweet),
    warm: level(profileRaw.warm),
    woody: level(profileRaw.woody),
    intensity: clamp(Math.round(intensity + intensityShift * 0.5), 1, 5),
  };

  return {
    ranking,
    primary,
    alternative,
    fit,
    rows,
    reasons,
    exclusionNotes,
    blocked,
    profile,
    recommendation: recommend(primary, answers.purpose?.[0], answers.budget?.[0], fit),
  };
}

/** Übersetzt Kaufabsicht und Budget in ein konkretes Produktformat. */
function recommend(
  primary: ArchetypeId,
  purpose: string | undefined,
  budget: string | undefined,
  fit: Fit,
): Recommendation {
  const parfum = productForArchetype(primary).slug;
  const discovery: Recommendation = { productSlug: 'discovery-set', kind: 'discovery' };

  if (purpose === 'exploring' || fit === 'orientation' || fit === 'compromise') return discovery;
  if (budget === 'under-30') return discovery;
  if (purpose === 'gift') {
    return budget === '60-90'
      ? { productSlug: parfum, variantId: '50ml', kind: 'parfum' }
      : { productSlug: 'gift-experience', kind: 'gift' };
  }
  if (budget === '30-60') return { productSlug: parfum, variantId: '30ml', kind: 'parfum' };
  return { productSlug: parfum, variantId: '50ml', kind: 'parfum' };
}

export function isComplete(answers: Answers): boolean {
  return visibleQuestions(answers).every((q) => q.optional || (answers[q.id]?.length ?? 0) > 0);
}

/*
 * Kompakte, teilbare Kodierung: ein Buchstabe pro Frage, gefolgt von den
 * Positionen der gewählten Antworten, z. B. "e0.u2.f03…".
 */
const SHORT: Record<QuestionId, string> = {
  energy: 'e',
  universe: 'u',
  families: 'f',
  feeling: 'l',
  occasions: 'o',
  intensity: 'i',
  sweetness: 's',
  avoid: 'a',
  adventure: 'd',
  purpose: 'p',
  budget: 'b',
};

export function encodeAnswers(answers: Answers): string {
  return QUESTIONS.flatMap((q) => {
    const indexes = (answers[q.id] ?? [])
      .map((id) => q.answers.findIndex((a) => a.id === id))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    return indexes.length ? [`${SHORT[q.id]}${indexes.join('')}`] : [];
  }).join('.');
}

export function decodeAnswers(code: string): Answers | null {
  const answers: Answers = {};
  for (const part of code.split('.')) {
    const question = QUESTIONS.find((q) => SHORT[q.id] === part[0]);
    if (!question) return null;
    const ids = [...part.slice(1)]
      .map(Number)
      .filter((i) => Number.isInteger(i) && i >= 0 && i < question.answers.length)
      .map((i) => question.answers[i].id);
    if (ids.length === 0) return null;
    answers[question.id] = question.kind === 'single' ? ids.slice(0, 1) : [...new Set(ids)];
  }
  return answers;
}
