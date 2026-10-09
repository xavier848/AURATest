import type { Tag } from './archetypes';
import type { ArchetypeId } from './products';

/*
 * Zentrale Konfiguration des AURA Duftfinders.
 * Fragen, Antworten und Gewichtungen liegen ausschließlich hier, damit die
 * Matching-Logik angepasst werden kann, ohne den Test neu zu bauen (Businessplan 8.3).
 * Die Werte sind ein Startmodell und müssen mit den echten Duftkompositionen
 * und Testpersonen überprüft werden (Businessplan 5.2).
 */

export type QuestionId =
  | 'energy'
  | 'universe'
  | 'families'
  | 'feeling'
  | 'occasions'
  | 'intensity'
  | 'sweetness'
  | 'avoid'
  | 'adventure'
  | 'purpose'
  | 'budget';

export type Scores = Record<ArchetypeId, number>;
export type ProfileKey = 'fresh' | 'floral' | 'sweet' | 'warm' | 'woody';

/**
 * Wofür eine Antwort zählt. Wird für den Tie-Breaker (5.4) und die
 * transparente Punktetabelle auf der Ergebnisseite genutzt.
 */
export type QuestionGroup = 'notes' | 'exclusion' | 'context' | 'mood' | 'aesthetic' | 'purpose';

export type Motif =
  | 'sun'
  | 'sunrise'
  | 'breeze'
  | 'petals'
  | 'flower'
  | 'velvet'
  | 'arch'
  | 'streaks'
  | 'citrus'
  | 'drop'
  | 'drops'
  | 'rings'
  | 'star'
  | 'ripple'
  | 'mist'
  | 'embrace'
  | 'moon'
  | 'spark'
  | 'orbit'
  | 'grid'
  | 'candle'
  | 'globe'
  | 'halo'
  | 'leaf'
  | 'bottle'
  | 'gift'
  | 'compass';

export interface MoodPalette {
  bg: [string, string];
  glow: string;
  accent: string;
  line: string;
  dark?: boolean;
}

export interface Art {
  motif: Motif;
  palette: MoodPalette;
  level?: 1 | 2 | 3;
}

export interface Exclusion {
  /** Negative Punkte – bewusst stärker als ästhetische Signale (5.3) */
  penalties: Partial<Scores>;
  /** Düfte, die nach Möglichkeit gar nicht empfohlen werden sollen */
  hard?: ArchetypeId[];
  explain: string;
}

export interface Answer {
  id: string;
  label: string;
  description: string;
  art?: Art;
  /** Schließt alle anderen Antworten der Frage aus (z. B. „Not sure yet“) */
  exclusive?: boolean;
  scores?: Partial<Scores>;
  profile?: Partial<Record<ProfileKey, number>>;
  /** Setzt die gewünschte Intensität (1–5) */
  intensity?: number;
  intensityShift?: number;
  tags?: Tag[];
  exclusion?: Exclusion;
}

export interface Question {
  id: QuestionId;
  kind: 'single' | 'multi';
  layout: 'art' | 'chips' | 'price';
  group: QuestionGroup;
  /** Kurzer deutscher Themenname, z. B. „Bildwelt“ */
  label: string;
  title: string;
  prompt: string;
  helper: string;
  optional?: boolean;
  answers: Answer[];
}

export type Answers = Partial<Record<QuestionId, string[]>>;

const MOOD = {
  dawn: { bg: ['#FCF6EA', '#EFD9AC'], glow: '#FFFDF6', accent: '#D6AE6B', line: '#9C7036' },
  linen: { bg: ['#F7F2EB', '#E2D8CB'], glow: '#FFFFFF', accent: '#B3A292', line: '#7A6A5E' },
  sage: { bg: ['#F2F3EB', '#D2D9C6'], glow: '#FFFFFF', accent: '#9AA588', line: '#5B6750' },
  blush: { bg: ['#F9EBE8', '#E5B8BF'], glow: '#FFF8F6', accent: '#CB8B99', line: '#965466' },
  mauve: { bg: ['#F2E7ED', '#C8A8BA'], glow: '#FCF6F9', accent: '#8F6983', line: '#6A465E' },
  velvet: { bg: ['#2B1724', '#59304A'], glow: '#E9C9A2', accent: '#A9596F', line: '#E9C9A2', dark: true },
  espresso: { bg: ['#2A201C', '#51392C'], glow: '#E8C69C', accent: '#AE7E52', line: '#E8C69C', dark: true },
  night: { bg: ['#141217', '#2C2533'], glow: '#F7F3EE', accent: '#D9A7B0', line: '#F7F3EE', dark: true },
  electric: { bg: ['#110F17', '#28203D'], glow: '#F4F0FF', accent: '#9DB5F2', line: '#ECE6FF', dark: true },
  stone: { bg: ['#EFEBE5', '#D3CABE'], glow: '#FFFFFF', accent: '#9B8C82', line: '#17151A' },
  citrus: { bg: ['#FCF6E5', '#F2D896'], glow: '#FFFFFF', accent: '#E0AE4C', line: '#94671D' },
  amber: { bg: ['#F7E9D9', '#DDAE7E'], glow: '#FFF6EA', accent: '#B0713F', line: '#774524' },
  spice: { bg: ['#3B2026', '#6F3542'], glow: '#EEBE94', accent: '#C9784F', line: '#EEBE94', dark: true },
  wood: { bg: ['#EFE7DB', '#C8B194'], glow: '#FFF9F0', accent: '#8C6F52', line: '#5A4434' },
  musk: { bg: ['#F8F5F1', '#E5DED6'], glow: '#FFFFFF', accent: '#BAAEA4', line: '#776C63' },
} satisfies Record<string, MoodPalette>;

const art = (motif: Motif, palette: MoodPalette, level?: 1 | 2 | 3): Art => ({ motif, palette, level });

export const QUESTIONS: Question[] = [
  {
    id: 'energy',
    kind: 'single',
    layout: 'art',
    group: 'mood',
    label: 'Wirkung',
    title: 'What energy do you want to give off?',
    prompt: 'How do you want people to experience your presence?',
    helper: 'Wähle eine Antwort.',
    answers: [
      {
        id: 'fresh-effortless',
        label: 'Fresh & Effortless',
        description: 'frisch, leicht, unkompliziert',
        art: art('breeze', MOOD.sage),
        scores: { glow: 3, muse: 1, afterglow: 0 },
        profile: { fresh: 1 },
        tags: ['fresh-energy'],
      },
      {
        id: 'soft-elegant',
        label: 'Soft & Elegant',
        description: 'weich, elegant, gepflegt',
        art: art('petals', MOOD.blush),
        scores: { glow: 1, muse: 3, afterglow: 1 },
        profile: { floral: 1 },
        tags: ['soft'],
      },
      {
        id: 'warm-magnetic',
        label: 'Warm & Magnetic',
        description: 'warm, sinnlich, anziehend',
        art: art('velvet', MOOD.velvet),
        scores: { glow: 0, muse: 1, afterglow: 3 },
        profile: { warm: 1 },
        tags: ['warm'],
      },
      {
        id: 'bold-unforgettable',
        label: 'Bold & Unforgettable',
        description: 'markant, ausdrucksstark, präsent',
        art: art('spark', MOOD.night),
        scores: { glow: 0, muse: 1, afterglow: 3 },
        intensityShift: 1,
        tags: ['bold'],
      },
      {
        id: 'creative-unexpected',
        label: 'Creative & Unexpected',
        description: 'kreativ, ungewöhnlich, individuell',
        art: art('orbit', MOOD.mauve),
        scores: { glow: 1, muse: 2, afterglow: 1 },
        tags: ['creative'],
      },
    ],
  },
  {
    id: 'universe',
    kind: 'single',
    layout: 'art',
    group: 'aesthetic',
    label: 'Bildwelt',
    title: 'Choose your visual universe',
    prompt: 'Which world feels most like you?',
    helper: 'Wähle eine Antwort. Deine Bildwelt prägt vor allem die Gestaltung deines Ergebnisses.',
    answers: [
      {
        id: 'golden-morning',
        label: 'Golden Morning',
        description: 'helles Licht, Creme, Sonnenschein',
        art: art('sun', MOOD.dawn),
        scores: { glow: 1 },
        tags: ['golden'],
      },
      {
        id: 'soft-romance',
        label: 'Soft Romance',
        description: 'Rosé, Blumen, weiche Stoffe',
        art: art('petals', MOOD.blush),
        scores: { muse: 1 },
        tags: ['romance'],
      },
      {
        id: 'midnight-velvet',
        label: 'Midnight Velvet',
        description: 'dunkle Farben, Samt, warmes Licht',
        art: art('velvet', MOOD.velvet),
        scores: { afterglow: 1 },
        tags: ['midnight'],
      },
      {
        id: 'modern-muse',
        label: 'Modern Muse',
        description: 'Architektur, Kunst, klare Formen',
        art: art('arch', MOOD.stone),
        scores: { muse: 1 },
        tags: ['modern'],
      },
      {
        id: 'electric-energy',
        label: 'Electric Energy',
        description: 'Kontraste, Lichtreflexe, moderne Farben',
        art: art('streaks', MOOD.electric),
      },
    ],
  },
  {
    id: 'families',
    kind: 'multi',
    layout: 'art',
    group: 'notes',
    label: 'Duftfamilien',
    title: 'Which scent family attracts you most?',
    prompt: 'Which scents would you love to explore?',
    helper: 'Mehrfachauswahl möglich.',
    answers: [
      {
        id: 'fresh-citrus',
        label: 'Fresh & Citrus',
        description: 'Zitrus, grüne Noten, frische Akkorde',
        art: art('citrus', MOOD.citrus),
        scores: { glow: 3, muse: 1, afterglow: 0 },
        profile: { fresh: 3 },
        tags: ['citrus'],
      },
      {
        id: 'floral-soft',
        label: 'Floral & Soft',
        description: 'Rose, Jasmin, Pfingstrose',
        art: art('flower', MOOD.blush),
        scores: { glow: 1, muse: 3, afterglow: 1 },
        profile: { floral: 3 },
        tags: ['floral'],
      },
      {
        id: 'sweet-gourmand',
        label: 'Sweet & Gourmand',
        description: 'Vanille, süße und cremige Akkorde',
        art: art('drop', MOOD.amber),
        scores: { glow: 1, muse: 1, afterglow: 3 },
        profile: { sweet: 3 },
        tags: ['sweet'],
      },
      {
        id: 'woody-earthy',
        label: 'Woody & Earthy',
        description: 'Sandelholz, Zedernholz, erdige Noten',
        art: art('rings', MOOD.wood),
        scores: { glow: 1, muse: 1, afterglow: 2 },
        profile: { woody: 3 },
        tags: ['woody'],
      },
      {
        id: 'warm-spicy',
        label: 'Warm & Spicy',
        description: 'Gewürze, Amber-Akkorde, warme Noten',
        art: art('star', MOOD.spice),
        scores: { glow: 0, muse: 1, afterglow: 3 },
        profile: { warm: 3 },
        tags: ['spicy'],
      },
      {
        id: 'clean-musky',
        label: 'Clean & Musky',
        description: 'saubere, weiche, hautnahe Akkorde',
        art: art('ripple', MOOD.musk),
        scores: { glow: 3, muse: 2, afterglow: 1 },
        profile: { fresh: 1 },
        tags: ['musk'],
      },
      {
        id: 'not-sure',
        label: 'Not sure yet',
        description: 'Ich kenne meine Duftvorlieben noch nicht.',
        art: art('mist', MOOD.linen),
        exclusive: true,
      },
    ],
  },
  {
    id: 'feeling',
    kind: 'single',
    layout: 'art',
    group: 'mood',
    label: 'Gefühl',
    title: 'What should your fragrance feel like?',
    prompt: 'Choose the feeling you want to return to.',
    helper: 'Wähle eine Antwort.',
    answers: [
      {
        id: 'fresh-start',
        label: 'A fresh start',
        description: 'frisch, klar, leicht',
        art: art('sunrise', MOOD.sage),
        scores: { glow: 3, muse: 1, afterglow: 0 },
        profile: { fresh: 1 },
        tags: ['fresh-energy'],
      },
      {
        id: 'soft-embrace',
        label: 'A soft embrace',
        description: 'warm, weich, geborgen',
        art: art('embrace', MOOD.blush),
        scores: { glow: 0, muse: 2, afterglow: 2 },
        profile: { warm: 1 },
        tags: ['soft', 'warm'],
      },
      {
        id: 'little-mystery',
        label: 'A little mystery',
        description: 'tief, geheimnisvoll, elegant',
        art: art('moon', MOOD.velvet),
        scores: { glow: 0, muse: 1, afterglow: 3 },
        profile: { warm: 1, woody: 1 },
        tags: ['mystery'],
      },
      {
        id: 'pure-confidence',
        label: 'Pure confidence',
        description: 'selbstbewusst, präsent, markant',
        art: art('spark', MOOD.espresso),
        scores: { glow: 0, muse: 1, afterglow: 3 },
        intensityShift: 1,
        tags: ['bold'],
      },
      {
        id: 'beautiful-escape',
        label: 'A beautiful escape',
        description: 'kreativ, verträumt, außergewöhnlich',
        art: art('orbit', MOOD.mauve),
        scores: { glow: 1, muse: 3, afterglow: 1 },
        tags: ['creative'],
      },
    ],
  },
  {
    id: 'occasions',
    kind: 'multi',
    layout: 'art',
    group: 'context',
    label: 'Anlässe',
    title: 'When will you wear your scent?',
    prompt: 'Where should your fragrance belong?',
    helper: 'Mehrfachauswahl möglich.',
    answers: [
      {
        id: 'every-day',
        label: 'Every day',
        description: 'Alltag',
        art: art('sunrise', MOOD.dawn),
        scores: { glow: 2, muse: 1, afterglow: 0 },
        tags: ['day'],
      },
      {
        id: 'work-study',
        label: 'Work & Study',
        description: 'Arbeit, Universität, Büro',
        art: art('grid', MOOD.stone),
        scores: { glow: 2, muse: 1, afterglow: 0 },
        intensityShift: -1,
        tags: ['day'],
      },
      {
        id: 'dates-dinners',
        label: 'Dates & Dinners',
        description: 'Dates, Restaurant, besondere Abende',
        art: art('candle', MOOD.velvet),
        scores: { glow: 0, muse: 1, afterglow: 2 },
        tags: ['evening'],
      },
      {
        id: 'events-nights',
        label: 'Events & Nights Out',
        description: 'Events, Partys, Ausgehen',
        art: art('streaks', MOOD.night),
        scores: { glow: 0, muse: 0, afterglow: 2 },
        intensityShift: 1,
        tags: ['evening', 'bold'],
      },
      {
        id: 'special-moments',
        label: 'Special Moments',
        description: 'besondere Anlässe',
        art: art('spark', MOOD.blush),
        scores: { glow: 0, muse: 1, afterglow: 1 },
        tags: ['evening'],
      },
      {
        id: 'everywhere',
        label: 'Everywhere',
        description: 'ein vielseitiger Signature-Duft',
        art: art('globe', MOOD.linen),
        scores: { glow: 2, muse: 1, afterglow: 0 },
        tags: ['versatile'],
      },
    ],
  },
  {
    id: 'intensity',
    kind: 'single',
    layout: 'art',
    group: 'context',
    label: 'Intensität',
    title: 'How present should your fragrance be?',
    prompt: 'How noticeable do you like your scent?',
    helper: 'Wähle eine Antwort. Haltbarkeit und Projektion testen wir für jeden Duft vor dem Launch.',
    answers: [
      {
        id: 'subtle',
        label: 'Close & Subtle',
        description: 'eher dezent und hautnah',
        art: art('halo', MOOD.musk, 1),
        scores: { glow: 2, muse: 1, afterglow: -2 },
        intensity: 2,
        tags: ['subtle'],
      },
      {
        id: 'balanced',
        label: 'Balanced',
        description: 'wahrnehmbar, aber nicht dominant',
        art: art('halo', MOOD.blush, 2),
        scores: { glow: 1, muse: 2, afterglow: 0 },
        intensity: 3,
        tags: ['balanced'],
      },
      {
        id: 'bold',
        label: 'Bold & Lasting',
        description: 'ausdrucksstark und lang anhaltend',
        art: art('halo', MOOD.velvet, 3),
        scores: { glow: -1, muse: 0, afterglow: 3 },
        intensity: 5,
        tags: ['bold'],
      },
    ],
  },
  {
    id: 'sweetness',
    kind: 'single',
    layout: 'art',
    group: 'notes',
    label: 'Süße',
    title: 'What is your relationship with sweetness?',
    prompt: 'How do you feel about sweet fragrances?',
    helper: 'Wähle eine Antwort.',
    answers: [
      {
        id: 'love-it',
        label: 'Love it',
        description: 'ich liebe süße Düfte',
        art: art('drops', MOOD.amber, 3),
        scores: { glow: 0, muse: 1, afterglow: 3 },
        profile: { sweet: 2 },
        tags: ['sweet'],
      },
      {
        id: 'a-little',
        label: 'A little sweetness',
        description: 'etwas Süße ist schön',
        art: art('drops', MOOD.blush, 1),
        scores: { glow: 1, muse: 2, afterglow: 1 },
        profile: { sweet: 1 },
        tags: ['little-sweet'],
      },
      {
        id: 'fresh-woody',
        label: 'Prefer fresh or woody',
        description: 'lieber frisch oder holzig',
        art: art('leaf', MOOD.sage),
        scores: { glow: 2, muse: 0, afterglow: -1 },
        profile: { sweet: -2, fresh: 1, woody: 1 },
        tags: ['fresh-woody'],
      },
      {
        id: 'not-sure',
        label: 'Not sure',
        description: 'ich bin offen für Empfehlungen',
        art: art('mist', MOOD.linen),
      },
    ],
  },
  {
    id: 'avoid',
    kind: 'multi',
    layout: 'chips',
    group: 'exclusion',
    label: 'Was du meidest',
    title: 'Which notes would you rather avoid?',
    prompt: 'Are there any scent directions you usually avoid?',
    helper: 'Mehrfachauswahl möglich. Was du hier auswählst, wiegt stärker als deine Bildwelt.',
    answers: [
      {
        id: 'very-sweet',
        label: 'Very sweet',
        description: 'sehr süße Noten',
        exclusion: {
          penalties: { afterglow: -8, muse: -1 },
          hard: ['afterglow'],
          explain:
            'Du meidest sehr süße Düfte. Vanille und Tonkabohne machen AURA 03 zum süßesten Duft der Kollektion, deshalb haben wir ihn zurückgestellt.',
        },
      },
      {
        id: 'heavy-florals',
        label: 'Heavy florals',
        description: 'schwere Blüten',
        exclusion: {
          penalties: { muse: -7, glow: -1 },
          hard: ['muse'],
          explain:
            'Du meidest schwere Blüten. AURA 02 trägt ein ausgeprägtes Herz aus Jasmin, Rose und Pfingstrose, deshalb haben wir ihn zurückgestellt.',
        },
      },
      {
        id: 'strong-spices',
        label: 'Strong spices',
        description: 'kräftige Gewürze',
        exclusion: {
          penalties: { afterglow: -7 },
          hard: ['afterglow'],
          explain:
            'Du meidest kräftige Gewürze. AURA 03 enthält Rosa Pfeffer und Gewürznoten, deshalb haben wir ihn zurückgestellt.',
        },
      },
      {
        id: 'smoky-leather',
        label: 'Smoky or leathery notes',
        description: 'rauchig oder ledrig',
        exclusion: {
          penalties: {},
          explain: 'Rauchige oder ledrige Noten kommen in keinem der drei AURA-Düfte vor.',
        },
      },
      {
        id: 'strong-woody',
        label: 'Strong woody notes',
        description: 'kräftige Hölzer',
        exclusion: {
          penalties: { afterglow: -3, muse: -1 },
          explain: 'Du meidest kräftige Hölzer. Die warmen Hölzer von AURA 03 haben wir deshalb schwächer gewichtet.',
        },
      },
      {
        id: 'powdery',
        label: 'Powdery notes',
        description: 'pudrige Noten',
        exclusion: {
          penalties: { muse: -2, glow: -1 },
          explain:
            'Moschus kann leicht pudrig wirken. AURA 02 und AURA 01 haben wir deshalb etwas schwächer gewichtet.',
        },
      },
      { id: 'none', label: 'None in particular', description: 'nichts Bestimmtes', exclusive: true },
      { id: 'not-sure', label: 'Not sure yet', description: 'weiß ich noch nicht', exclusive: true },
    ],
  },
  {
    id: 'adventure',
    kind: 'single',
    layout: 'art',
    group: 'mood',
    label: 'Neugier',
    title: 'How adventurous are you?',
    prompt: 'How do you like to discover new fragrances?',
    helper: 'Wähle eine Antwort.',
    answers: [
      {
        id: 'effortless',
        label: 'Keep it effortless',
        description: 'vertraut, unkompliziert, vielseitig',
        art: art('ripple', MOOD.linen),
        scores: { glow: 2, muse: 1, afterglow: 0 },
        tags: ['versatile'],
      },
      {
        id: 'little-different',
        label: 'A little different',
        description: 'etwas Besonderes, aber tragbar',
        art: art('orbit', MOOD.blush),
        scores: { glow: 0, muse: 2, afterglow: 1 },
        tags: ['creative'],
      },
      {
        id: 'statement',
        label: 'Make a statement',
        description: 'ungewöhnlich, mutig, auffällig',
        art: art('spark', MOOD.night),
        scores: { glow: 0, muse: 0, afterglow: 2 },
        intensityShift: 1,
        tags: ['bold'],
      },
    ],
  },
  {
    id: 'purpose',
    kind: 'single',
    layout: 'art',
    group: 'purpose',
    label: 'Dein Ziel',
    title: 'What are you looking for today?',
    prompt: 'What would make this discovery perfect for you?',
    helper: 'Wähle eine Antwort.',
    answers: [
      {
        id: 'signature',
        label: 'My signature scent',
        description: 'mein neuer Signature-Duft',
        art: art('bottle', MOOD.dawn),
      },
      {
        id: 'everyday',
        label: 'An everyday fragrance',
        description: 'ein Duft für jeden Tag',
        art: art('sunrise', MOOD.sage),
        scores: { glow: 1 },
        tags: ['day'],
      },
      {
        id: 'special',
        label: 'A special occasion scent',
        description: 'ein Duft für besondere Momente',
        art: art('candle', MOOD.espresso),
        scores: { afterglow: 1 },
        tags: ['evening'],
      },
      {
        id: 'gift',
        label: 'A gift',
        description: 'ein Geschenk',
        art: art('gift', MOOD.blush),
      },
      {
        id: 'exploring',
        label: 'I’m exploring',
        description: 'ich möchte meine Duftvorlieben erst entdecken',
        art: art('compass', MOOD.stone),
      },
    ],
  },
  {
    id: 'budget',
    kind: 'single',
    layout: 'price',
    group: 'purpose',
    label: 'Budget',
    optional: true,
    title: 'What would you like to spend?',
    prompt: 'Optional – hilft uns, das passende Format zu empfehlen.',
    helper: 'Gemeint ist der Produktpreis. Versandkosten weisen wir immer separat aus.',
    answers: [
      { id: 'under-30', label: 'Under €30', description: 'bis 30 €' },
      { id: '30-60', label: '€30–€60', description: '30 bis 60 €' },
      { id: '60-90', label: '€60–€90', description: '60 bis 90 €' },
      { id: 'open', label: 'I’m open', description: 'offen für Empfehlungen' },
    ],
  },
];

export const REQUIRED_QUESTION_COUNT = QUESTIONS.filter((q) => !q.optional).length;

/** Die Budgetfrage erscheint nur, wenn sie das empfohlene Format verändern kann. */
export function visibleQuestions(answers: Answers): Question[] {
  const purpose = answers.purpose?.[0];
  return QUESTIONS.filter((q) => q.id !== 'budget' || (purpose !== undefined && purpose !== 'exploring'));
}

export function getQuestion(id: QuestionId): Question {
  const question = QUESTIONS.find((q) => q.id === id);
  if (!question) throw new Error(`Unbekannte Frage ${id}`);
  return question;
}
