import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, LinkIcon, RefreshIcon } from '../components/Icons';
import { MoodArt } from '../components/MoodArt';
import { NotesPyramid } from '../components/NotesPyramid';
import { ProductStage } from '../components/ProductStage';
import { ARCHETYPES } from '../data/archetypes';
import { getProductBySlug, productForArchetype, type ArchetypeId } from '../data/products';
import { getQuestion, type Answers } from '../data/quiz';
import { track } from '../lib/consent';
import { formatPrice } from '../lib/format';
import { computeMatch, decodeAnswers, isComplete, type Fit, type MatchResult } from '../lib/matching';
import { clearProgress, loadResult } from '../lib/quizStore';
import { usePageMeta } from '../lib/usePageMeta';

const FIT_LABEL: Record<Fit, string> = {
  clear: 'Klare Übereinstimmung',
  good: 'Gute Übereinstimmung',
  orientation: 'Erste Orientierung',
  compromise: 'Nächstbeste Option',
};

const ALT_HINT: Record<ArchetypeId, string> = {
  glow: 'Falls du es frischer und leichter magst.',
  muse: 'Falls du es weicher und floraler magst.',
  afterglow: 'Falls du es wärmer und intensiver magst.',
};

const METERS = [
  { key: 'fresh', label: 'Frische' },
  { key: 'floral', label: 'Blumig' },
  { key: 'sweet', label: 'Süße' },
  { key: 'warm', label: 'Wärme' },
  { key: 'woody', label: 'Holzig' },
  { key: 'intensity', label: 'Intensität' },
] as const;

const LEVEL_WORD = ['', 'kaum', 'leicht', 'mittel', 'deutlich', 'stark'];

/** Akzentfarbe je Archetyp für Diagramme auf hellem Grund */
const ACCENT: Record<ArchetypeId, string> = {
  glow: '#A6814B',
  muse: '#B0697A',
  afterglow: '#4C293F',
};

const INTENSITY_TEXT: Record<string, string> = {
  subtle: 'Dein Duft darf hautnah bleiben.',
  balanced: 'Er soll wahrnehmbar sein, ohne zu dominieren.',
  bold: 'Er darf Präsenz zeigen und lange bleiben.',
};

/** Wohin die Vorlieben eigentlich zeigen, wenn der passende Duft ausgeschlossen wurde */
const BLOCKED_DIRECTION: Record<ArchetypeId, string> = {
  glow: 'Frische und Leichtigkeit',
  muse: 'weichen Blüten und Eleganz',
  afterglow: 'Wärme und Tiefe',
};

const COMPROMISE_CHARACTER: Record<ArchetypeId, string> = {
  glow: 'leicht und klar, mit Bergamotte und weißem Moschus',
  muse: 'weich und warm, mit Sandelholz und Moschus in der Basis',
  afterglow: 'warm und tief, mit Amber und warmen Hölzern',
};

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

function personalText(answers: Answers): string {
  const families = getQuestion('families')
    .answers.filter((a) => answers.families?.includes(a.id) && !a.exclusive)
    .map((a) => a.label);
  const occasions = getQuestion('occasions')
    .answers.filter((a) => answers.occasions?.includes(a.id))
    .map((a) => a.label);
  const parts: string[] = [];
  parts.push(
    families.length
      ? `Bei den Duftfamilien hast du ${listJoin(families)} gewählt.`
      : 'Deine Lieblingsduftfamilien kennst du noch nicht, deshalb haben wir uns stärker an Wirkung und Anlass orientiert.',
  );
  const intensity = answers.intensity?.[0];
  if (intensity && INTENSITY_TEXT[intensity]) parts.push(INTENSITY_TEXT[intensity]);
  if (occasions.length) parts.push(`Tragen möchtest du ihn vor allem: ${listJoin(occasions)}.`);
  return parts.join(' ');
}

export default function Result() {
  const [params, setParams] = useSearchParams();
  const [saved] = useState(loadResult);
  const paramCode = params.get('r');
  const code = paramCode ?? saved?.code ?? null;
  const answers = useMemo(() => (code ? decodeAnswers(code) : null), [code]);
  const result = useMemo(() => (answers && isComplete(answers) ? computeMatch(answers) : null), [answers]);
  const archetype = result ? ARCHETYPES[result.primary] : null;

  usePageMeta(
    archetype ? `Your AURA is ${archetype.name}` : 'Dein Ergebnis',
    archetype ? `${archetype.tagline} ${archetype.message}` : undefined,
  );

  useEffect(() => {
    if (!paramCode && saved) setParams({ r: saved.code }, { replace: true });
  }, [paramCode, saved, setParams]);

  const tracked = useRef(false);
  useEffect(() => {
    if (result && !tracked.current) {
      tracked.current = true;
      track('result_view', { profile: result.primary, fit: result.fit });
    }
  }, [result]);

  if (!result || !answers || !archetype || !code) {
    return (
      <section className="section result-empty">
        <div className="container narrow">
          <p className="eyebrow">Dein Ergebnis</p>
          <h1 className="h-xl">Noch kein Ergebnis gefunden.</h1>
          <p className="muted">
            Dieser Link ist unvollständig, oder du hast den Duftfinder in diesem Browser noch nicht abgeschlossen. In
            zwei bis drei Minuten hast du dein persönliches Duftprofil.
          </p>
          <Link to="/duftfinder?start=1" className="btn">
            Find my AURA
          </Link>
        </div>
      </section>
    );
  }

  const shared = Boolean(paramCode) && saved?.code !== paramCode;
  return <ResultView result={result} answers={answers} code={code} shared={shared} />;
}

interface ResultViewProps {
  result: MatchResult;
  answers: Answers;
  code: string;
  shared: boolean;
}

function ResultView({ result, answers, code, shared }: ResultViewProps) {
  const archetype = ARCHETYPES[result.primary];
  const product = productForArchetype(result.primary);
  const alternative = result.alternative ? productForArchetype(result.alternative) : null;
  const universeAnswer = getQuestion('universe').answers.find((a) => a.id === answers.universe?.[0]);
  const recommended = getProductBySlug(result.recommendation.productSlug);
  const recommendedVariant =
    recommended?.variants.find((v) => v.id === result.recommendation.variantId) ?? recommended?.variants[0];
  const scene = archetype.scene;
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'manual'>('idle');
  const shareUrl = `${window.location.origin}/duftfinder/ergebnis?r=${code}`;

  const pageStyle = { '--accent': ACCENT[result.primary] } as CSSProperties;
  const sceneStyle = {
    '--scene-bg': scene.bg,
    '--scene-ink': scene.ink,
    '--scene-muted': scene.muted,
    '--aura-1': scene.aura[0],
    '--aura-2': scene.aura[1],
    '--aura-3': universeAnswer?.art?.palette.accent ?? scene.aura[2],
  } as CSSProperties;

  const productLink = `/shop/${product.slug}${result.recommendation.kind === 'parfum' ? `?v=${result.recommendation.variantId}` : ''}`;
  const ctas =
    result.recommendation.kind === 'parfum'
      ? [
          { to: productLink, label: 'Discover your scent', primary: true },
          { to: '/shop/discovery-set', label: 'Explore the discovery set', primary: false },
        ]
      : result.recommendation.kind === 'gift'
        ? [
            { to: '/shop/gift-experience', label: 'Explore the gift experience', primary: true },
            { to: productLink, label: 'Discover your scent', primary: false },
          ]
        : [
            { to: '/shop/discovery-set', label: 'Explore the discovery set', primary: true },
            { to: productLink, label: 'Discover your scent', primary: false },
          ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('done');
      track('result_share', { profile: result.primary });
    } catch {
      setCopyState('manual');
    }
  };

  const [firstWord, ...rest] = archetype.name.split(' ');
  const word = rest.join(' ');

  return (
    <div className="result" style={pageStyle}>
      <section className={`reveal-hero grain ${scene.dark ? 'is-dark' : ''}`} style={sceneStyle}>
        <div className="reveal-hero__orb" aria-hidden="true" />
        <div className="container reveal-hero__inner">
          {shared && <p className="reveal-hero__shared">Geteiltes Ergebnis</p>}
          <p className="eyebrow reveal-hero__kicker">Your AURA is</p>
          <h1 className="reveal-hero__name" aria-label={archetype.name}>
            <span className="reveal-hero__the" aria-hidden="true">
              {firstWord}
            </span>
            <span className="reveal-hero__word" aria-hidden="true">
              {[...word].map((letter, i) => (
                <span key={i} style={{ '--i': i } as CSSProperties}>
                  {letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="reveal-hero__tagline">{archetype.tagline}</p>
          <p className="reveal-hero__message">“{archetype.message}”</p>
          <p className={`fit-badge fit-badge--${result.fit}`}>{FIT_LABEL[result.fit]}</p>
        </div>
      </section>

      <section className="section result-profile">
        <div className="container result-profile__inner">
          <div className="result-profile__text">
            <p className="eyebrow">Dein Duftprofil</p>
            <h2 className="h-lg">
              {result.blocked
                ? `Deine Vorlieben zeigen in Richtung ${BLOCKED_DIRECTION[result.blocked.id]}, ${listJoin(result.blocked.signals)} möchtest du aber meiden. ${archetype.name} ist deine nächstbeste Option: ${COMPROMISE_CHARACTER[result.primary]}.`
                : archetype.description}
            </h2>
            <p className="muted">{personalText(answers)}</p>
            {result.fit === 'orientation' && (
              <p className="note">
                Du kennst deine Duftvorlieben noch nicht. Dieses Profil ist deshalb ein Startpunkt und keine sichere
                Vorhersage.
              </p>
            )}
          </div>
          <div className="result-profile__data">
            <ul className="meters" aria-label="Dein Duftprofil">
              {METERS.map((m) => {
                const value = result.profile[m.key];
                return (
                  <li key={m.key} className="meter">
                    <span className="meter__label">{m.label}</span>
                    <span className="meter__bar" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={n <= value ? 'is-on' : ''} />
                      ))}
                    </span>
                    <span className="meter__value">
                      {LEVEL_WORD[value]}
                      <span className="sr-only"> ({value} von 5)</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="palette">
              <p className="palette__title">Deine Farbwelt</p>
              <div className="palette__row">
                {archetype.colors.map((c) => (
                  <div key={c.hex} className="swatch">
                    <span className="swatch__chip" style={{ background: c.hex }} />
                    <span className="swatch__name">{c.name}</span>
                    <span className="swatch__hex">{c.hex}</span>
                  </div>
                ))}
                {universeAnswer?.art && (
                  <div className="swatch swatch--art">
                    <span className="swatch__chip grain">
                      <MoodArt art={universeAnswer.art} />
                    </span>
                    <span className="swatch__name">{universeAnswer.label}</span>
                    <span className="swatch__hex">Deine Bildwelt</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section result-match" aria-labelledby="match-title">
        <div className="container result-match__inner">
          <div className="result-match__media">
            <ProductStage product={product} reflection />
          </div>
          <div className="result-match__copy">
            <p className="eyebrow">Dein AURA-Match</p>
            <h2 id="match-title" className="h-xl">
              {product.fullName}
            </h2>
            <p className="result-match__character">{product.character}</p>
            {product.notes && <NotesPyramid notes={product.notes} />}

            <h3 className="result-match__subhead">Warum dieser Duft?</h3>
            <ul className="reasons">
              {result.reasons.map((reason) => (
                <li key={reason.text}>
                  <span className="reasons__icon" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <span>
                    <span className="reasons__signal">{reason.signal}</span>
                    {reason.text}
                  </span>
                </li>
              ))}
            </ul>

            {(result.exclusionNotes.length > 0 || result.fit !== 'clear') && (
              <div className="note-stack">
                {result.blocked && (
                  <p className="note">
                    Deine Vorlieben zeigen eigentlich in Richtung {productForArchetype(result.blocked.id).fullName}.
                    Weil du {listJoin(result.blocked.signals)} meiden möchtest, empfehlen wir dir {product.name} als
                    nächstbeste Option. Am sichersten testest du beide im Discovery Set.
                  </p>
                )}
                {result.fit === 'orientation' && (
                  <p className="note">
                    Erste Orientierung: Teste am besten alle drei Düfte im Discovery Set, bevor du dich festlegst.
                  </p>
                )}
                {result.fit === 'good' && alternative && (
                  <p className="note">
                    {product.name} und {alternative.name} liegen nah beieinander. Wir zeigen dir beide.
                  </p>
                )}
                {result.exclusionNotes.map((text) => (
                  <p key={text} className="note note--quiet">
                    {text}
                  </p>
                ))}
              </div>
            )}

            {recommended && recommendedVariant && (
              <p className="result-match__format">
                Empfohlenes Format: <strong>{recommended.name}</strong>
                {recommended.kind === 'parfum' ? `, ${recommendedVariant.label}` : ''} ·{' '}
                {formatPrice(recommendedVariant.priceCents)}
              </p>
            )}
            <div className="result-match__actions">
              {ctas.map((cta) => (
                <Link key={cta.label} to={cta.to} className={cta.primary ? 'btn' : 'btn btn--ghost'}>
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {alternative && (
        <section className="result-alt" aria-labelledby="alt-title">
          <div className="container">
            <Link to={`/shop/${alternative.slug}`} className="alt-card">
              <span className="alt-card__media">
                <ProductStage product={alternative} />
              </span>
              <span className="alt-card__body">
                <span className="eyebrow">Deine Alternative</span>
                <span id="alt-title" className="alt-card__name">
                  {alternative.fullName}
                </span>
                <span className="alt-card__text">
                  {ALT_HINT[alternative.archetype ?? 'glow']} {alternative.character}
                </span>
              </span>
              <span className="alt-card__arrow" aria-hidden="true">
                <ArrowRightIcon size={20} />
              </span>
            </Link>
          </div>
        </section>
      )}

      <section className="section result-calc">
        <div className="container narrow-wide">
          <details className="calc">
            <summary>
              <span>
                <span className="eyebrow">Transparentes Matching</span>
                <span className="calc__title">So ist dein Ergebnis entstanden</span>
              </span>
            </summary>
            <p className="muted calc__intro">
              Jede Antwort vergibt Punkte an die drei Duftprofile. Gemiedene Duftrichtungen zählen negativ und wiegen
              stärker als deine Bildwelt. Einen Duft, den du ausdrücklich meidest, empfehlen wir nach Möglichkeit nicht.
            </p>
            <div className="table-scroll">
              <table className="calc__table">
                <thead>
                  <tr>
                    <th scope="col">Frage</th>
                    <th scope="col">Deine Antwort</th>
                    <th scope="col" className="num">
                      Glow
                    </th>
                    <th scope="col" className="num">
                      Muse
                    </th>
                    <th scope="col" className="num">
                      Afterglow
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.question.id}>
                      <th scope="row">{row.question.title}</th>
                      <td>{row.answers.map((a) => a.label).join(', ')}</td>
                      {(['glow', 'muse', 'afterglow'] as const).map((id) => (
                        <td key={id} className={`num ${row.points[id] < 0 ? 'is-negative' : ''}`}>
                          {row.points[id] > 0 ? `+${row.points[id]}` : row.points[id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={2}>
                      Summe
                    </th>
                    {(['glow', 'muse', 'afterglow'] as const).map((id) => {
                      const entry = result.ranking.find((r) => r.id === id);
                      return (
                        <td key={id} className={`num ${id === result.primary ? 'is-winner' : ''}`}>
                          {entry?.total}
                          {entry?.hard ? ' *' : ''}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
            {result.ranking.some((r) => r.hard) && (
              <p className="fineprint">* enthält eine Duftrichtung, die du meiden möchtest</p>
            )}
          </details>
        </div>
      </section>

      <section className="result-actions">
        <div className="container result-actions__inner">
          <div className="result-actions__buttons">
            <button type="button" className="btn btn--ghost" onClick={copyLink}>
              <LinkIcon size={18} />
              {copyState === 'done' ? 'Link kopiert' : 'Ergebnis teilen'}
            </button>
            <Link to="/duftfinder?start=1" className="btn btn--ghost" onClick={clearProgress}>
              <RefreshIcon size={18} />
              Test neu starten
            </Link>
            <Link to="/shop" className="btn btn--ghost">
              Alle Düfte ansehen
            </Link>
          </div>
          {copyState === 'manual' && (
            <div className="share-fallback">
              <label htmlFor="share-url">Kopiere diesen Link, um dein Ergebnis zu teilen:</label>
              <input id="share-url" readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} autoFocus />
            </div>
          )}
          <p className="fineprint result-actions__disclaimer">
            AURA-Archetypen sind Markenprofile, keine wissenschaftlichen Persönlichkeitstypen. Der Duftfinder empfiehlt
            Duftprofile anhand deiner Angaben. Wie ein Duft auf deiner Haut riecht, zeigt erst der Test auf der Haut.
          </p>
        </div>
      </section>
    </div>
  );
}
