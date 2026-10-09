export type ArchetypeId = 'glow' | 'muse' | 'afterglow';
export type MetalTone = 'gold' | 'rose' | 'bronze';

export interface Variant {
  id: string;
  label: string;
  sizeMl?: number;
  priceCents: number;
}

export interface ProductTheme {
  /** Hintergrund der Produktbühne */
  panel: string;
  /** Dunkle Bühne, braucht helle Schrift */
  dark: boolean;
  halo: [string, string];
  liquid: [string, string];
  metal: MetalTone;
}

export interface Product {
  id: string;
  slug: string;
  kind: 'parfum' | 'set';
  number?: string;
  name: string;
  fullName: string;
  archetype?: ArchetypeId;
  character: string;
  description: string;
  notes?: { top: string[]; heart: string[]; base: string[] };
  keyNotes: string[];
  mood?: string[];
  palette: { name: string; hex: string }[];
  /** Geplante Intensität – muss mit echten Mustern getestet werden */
  intensity?: { level: 1 | 2 | 3; label: string };
  occasions?: string[];
  contents?: string[];
  forWhom: string;
  theme: ProductTheme;
  variants: Variant[];
}

// Alle Preise sind Testpreise aus dem Businessplan (Kapitel 3.4), keine kalkulierten Endpreise.
const EDP_VARIANTS: Variant[] = [
  { id: '30ml', label: '30 ml', sizeMl: 30, priceCents: 4900 },
  { id: '50ml', label: '50 ml', sizeMl: 50, priceCents: 7900 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'aura-01',
    slug: 'aura-01-the-glow',
    kind: 'parfum',
    number: '01',
    name: 'The Glow',
    fullName: 'AURA 01 — The Glow',
    archetype: 'glow',
    character: 'Frisch, strahlend, sauber und leicht.',
    description:
      'Ein heller Duft wie das erste Licht am Morgen. Bergamotte und Mandarine öffnen klar und lebendig, Orangenblüte bringt eine zarte Wärme ins Herz, weißer Moschus und helle Hölzer bleiben sauber auf der Haut.',
    notes: {
      top: ['Bergamotte', 'Mandarine'],
      heart: ['Orangenblüte', 'zarte florale Noten'],
      base: ['Weißer Moschus', 'helle Hölzer'],
    },
    keyNotes: ['Bergamotte', 'Mandarine', 'Orangenblüte', 'Weißer Moschus'],
    mood: ['Klarheit', 'Leichtigkeit', 'Energie'],
    palette: [
      { name: 'Champagne', hex: '#D7C3A4' },
      { name: 'Soft Ivory', hex: '#F7F3EE' },
      { name: 'Helles Gold', hex: '#E4CC97' },
    ],
    intensity: { level: 1, label: 'Dezent bis ausgewogen' },
    occasions: ['Alltag', 'Arbeit & Studium', 'Überall'],
    forWhom: 'Für alle, die frische, vielseitige Düfte für den Alltag mögen.',
    theme: {
      panel: '#EFE6D7',
      dark: false,
      halo: ['#E6CB95', '#FFF7E6'],
      liquid: ['#F8EACB', '#DDB879'],
      metal: 'gold',
    },
    variants: EDP_VARIANTS,
  },
  {
    id: 'aura-02',
    slug: 'aura-02-the-muse',
    kind: 'parfum',
    number: '02',
    name: 'The Muse',
    fullName: 'AURA 02 — The Muse',
    archetype: 'muse',
    character: 'Blumig, weich, elegant und romantisch.',
    description:
      'Saftige Birne und Bergamotte führen in ein Herz aus Jasmin, Rose und Pfingstrose. Moschus und Sandelholz geben dem Duft eine weiche, moderne Basis – elegant, ohne laut zu werden.',
    notes: {
      top: ['Birne', 'Bergamotte'],
      heart: ['Jasmin', 'Rose', 'Pfingstrose'],
      base: ['Moschus', 'Sandelholz'],
    },
    keyNotes: ['Birne', 'Jasmin', 'Rose', 'Sandelholz'],
    mood: ['Eleganz', 'Kreativität', 'Leichtigkeit'],
    palette: [
      { name: 'Dusty Rose', hex: '#D9A7B0' },
      { name: 'Rosé-Champagne', hex: '#E8C9BD' },
      { name: 'Soft Mauve', hex: '#B48DA0' },
    ],
    intensity: { level: 2, label: 'Ausgewogen' },
    occasions: ['Alltag', 'Dates & Dinner', 'Besondere Momente'],
    forWhom: 'Für alle, die einen eleganten, modernen und weichen Duft suchen.',
    theme: {
      panel: '#F1DFDD',
      dark: false,
      halo: ['#DFA3AF', '#FCEDE9'],
      liquid: ['#F8DCDE', '#D594A3'],
      metal: 'rose',
    },
    variants: EDP_VARIANTS,
  },
  {
    id: 'aura-03',
    slug: 'aura-03-the-afterglow',
    kind: 'parfum',
    number: '03',
    name: 'The Afterglow',
    fullName: 'AURA 03 — The Afterglow',
    archetype: 'afterglow',
    character: 'Warm, sinnlich, tief und ausdrucksstark.',
    description:
      'Rosa Pfeffer und Bergamotte setzen einen hellen Funken, bevor Amber-Akkorde und Gewürznoten den Duft wärmen. Vanille, Tonkabohne und warme Hölzer bleiben lange – für Abende, die nachklingen.',
    notes: {
      top: ['Rosa Pfeffer', 'Bergamotte'],
      heart: ['Amber-Akkorde', 'Gewürznoten'],
      base: ['Vanille', 'Tonkabohne', 'warme Hölzer'],
    },
    keyNotes: ['Rosa Pfeffer', 'Amber', 'Vanille', 'Tonkabohne'],
    mood: ['Selbstbewusstsein', 'Wärme', 'Abendstimmung'],
    palette: [
      { name: 'Plum', hex: '#4C293F' },
      { name: 'Espresso', hex: '#3B2A24' },
      { name: 'Bronze', hex: '#A67C52' },
    ],
    intensity: { level: 3, label: 'Ausdrucksstark' },
    occasions: ['Dates & Dinner', 'Events & Nights Out', 'Besondere Momente'],
    forWhom: 'Für alle, die warme, markante Düfte für Abende, Events und besondere Anlässe mögen.',
    theme: {
      panel: '#4C293F',
      dark: true,
      halo: ['#9A5A66', '#D29A62'],
      liquid: ['#A8596E', '#45192F'],
      metal: 'bronze',
    },
    variants: EDP_VARIANTS,
  },
  {
    id: 'discovery-set',
    slug: 'discovery-set',
    kind: 'set',
    name: 'The Discovery Set',
    fullName: 'AURA — The Discovery Set',
    character: 'Drei Düfte. Eine persönliche Entdeckung.',
    description:
      'Teste The Glow, The Muse und The Afterglow in Ruhe auf deiner eigenen Haut, bevor du dich für eine Vollgröße entscheidest. Jede Probe ist einem Duftprofil zugeordnet, eine Karte erklärt die Duftnoten und ein QR-Code führt zu deiner AURA Identity.',
    keyNotes: ['AURA 01', 'AURA 02', 'AURA 03'],
    contents: [
      'Drei Duftproben: AURA 01, 02 und 03',
      'Karte mit der Beschreibung jedes Duftes',
      'QR-Code zu deiner persönlichen AURA Identity',
      'Hochwertige, minimalistische Verpackung',
    ],
    palette: [
      { name: 'Champagne', hex: '#D7C3A4' },
      { name: 'Dusty Rose', hex: '#D9A7B0' },
      { name: 'Deep Plum', hex: '#4C293F' },
    ],
    forWhom: 'Für alle, die erst testen und dann entscheiden möchten.',
    theme: {
      panel: '#EAE2D7',
      dark: false,
      halo: ['#DDAFB6', '#F3E2C3'],
      liquid: ['#F8EACB', '#DDB879'],
      metal: 'gold',
    },
    variants: [{ id: 'set', label: '3 Duftproben', priceCents: 1900 }],
  },
  {
    id: 'gift-experience',
    slug: 'gift-experience',
    kind: 'set',
    name: 'The Gift Experience',
    fullName: 'AURA — The Gift Experience',
    character: 'Ein Duft-Erlebnis zum Verschenken.',
    description:
      'Das Discovery Set mit einer hochwertigen Grußkarte für deine persönliche Nachricht. Wer es bekommt, kann mit dem Duftfinder die eigene AURA Identity entdecken und den passenden Duft direkt auf der Haut testen.',
    keyNotes: ['Discovery Set', 'Grußkarte', 'AURA Identity'],
    contents: [
      'Das komplette Discovery Set mit drei Duftproben',
      'Hochwertige Grußkarte für deine Nachricht',
      'Optional: digitale AURA Identity für die beschenkte Person',
      'Geschenkverpackung folgt als spätere Erweiterung',
    ],
    palette: [
      { name: 'Dusty Rose', hex: '#D9A7B0' },
      { name: 'Rosé-Champagne', hex: '#E8C9BD' },
      { name: 'Deep Plum', hex: '#4C293F' },
    ],
    forWhom: 'Für alle, die ein persönliches Geschenk suchen.',
    theme: {
      panel: '#F2E4DE',
      dark: false,
      halo: ['#DCA4AE', '#F2DDBC'],
      liquid: ['#F8DCDE', '#D594A3'],
      metal: 'rose',
    },
    variants: [{ id: 'gift', label: 'Geschenkset', priceCents: 3400 }],
  },
];

export const PARFUMS = PRODUCTS.filter((p) => p.kind === 'parfum');
export const SETS = PRODUCTS.filter((p) => p.kind === 'set');

export function getProductBySlug(slug: string | undefined): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productForArchetype(id: ArchetypeId): Product {
  const product = PRODUCTS.find((p) => p.archetype === id);
  if (!product) throw new Error(`Kein Produkt für Archetyp ${id}`);
  return product;
}

export function lowestPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.priceCents));
}
