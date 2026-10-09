import type { ArchetypeId } from './products';

/** Signale aus den Quizantworten, die sich in eine Begründung übersetzen lassen. */
export type Tag =
  | 'citrus'
  | 'floral'
  | 'sweet'
  | 'woody'
  | 'spicy'
  | 'musk'
  | 'fresh-energy'
  | 'soft'
  | 'warm'
  | 'bold'
  | 'creative'
  | 'mystery'
  | 'day'
  | 'evening'
  | 'versatile'
  | 'subtle'
  | 'balanced'
  | 'little-sweet'
  | 'fresh-woody'
  | 'golden'
  | 'romance'
  | 'midnight'
  | 'modern';

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  message: string;
  description: string;
  fallbackReason: string;
  productSlug: string;
  colors: { name: string; hex: string }[];
  /** Farbwelt der Ergebnisseite */
  scene: { bg: string; ink: string; muted: string; aura: [string, string, string]; dark: boolean };
  reasons: Partial<Record<Tag, string>>;
}

export const ARCHETYPE_ORDER: ArchetypeId[] = ['glow', 'muse', 'afterglow'];

// Markenprofile, keine wissenschaftlichen Persönlichkeitstypen (Businessplan 5.5).
export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  glow: {
    id: 'glow',
    name: 'The Glow',
    tagline: 'Light, clear, effortless.',
    message: 'Your energy is effortless. Your scent should be too.',
    description:
      'Du magst Dinge, die leicht wirken und trotzdem etwas ausstrahlen: helles Licht, klare Linien und einen Duft, der dich durch den Tag begleitet, ohne dich zu übertönen.',
    fallbackReason:
      'Deine Angaben lassen noch vieles offen. AURA 01 ist der vielseitigste und leichteste Einstieg in die Kollektion.',
    productSlug: 'aura-01-the-glow',
    colors: [
      { name: 'Champagne', hex: '#D7C3A4' },
      { name: 'Soft Ivory', hex: '#F7F3EE' },
      { name: 'Helles Gold', hex: '#E4CC97' },
    ],
    scene: {
      bg: '#F3E9D9',
      ink: '#17151A',
      muted: '#655748',
      aura: ['#E6C98F', '#FFF8EA', '#D7C3A4'],
      dark: false,
    },
    reasons: {
      citrus: 'Bergamotte und Mandarine bilden die frische Kopfnote von AURA 01.',
      musk: 'Weißer Moschus macht AURA 01 sauber und hautnah.',
      floral: 'Orangenblüte bringt eine zarte, helle Blüte ins Herz von AURA 01.',
      woody: 'Helle Hölzer halten AURA 01 klar und modern.',
      sweet: 'Mandarine wirkt hell und nur ganz leicht süß.',
      'fresh-energy': 'Du wünschst dir eine frische, unkomplizierte Wirkung. Genau dafür ist AURA 01 gedacht.',
      day: 'Für Alltag, Arbeit und Uni ist AURA 01 als leichter, vielseitiger Duft angelegt.',
      versatile: 'Du suchst einen Duft für überall. AURA 01 ist der vielseitigste der drei.',
      subtle: 'Du magst es hautnah. AURA 01 ist bewusst leicht und dezent geplant.',
      'fresh-woody': 'Lieber frisch als süß: AURA 01 verzichtet auf schwere, süße Noten.',
      creative: 'Leicht, aber mit eigenem Charakter: Orangenblüte gibt AURA 01 eine helle Note.',
      golden: 'Deine Bildwelt Golden Morning spiegelt sich in der Champagne-Farbwelt von AURA 01.',
    },
  },
  muse: {
    id: 'muse',
    name: 'The Muse',
    tagline: 'Soft, elegant, unforgettable.',
    message: 'Your presence doesn’t need to be loud to be unforgettable.',
    description:
      'Du fühlst dich zu weichen Blüten, warmen Texturen und Düften hingezogen, die mühelos wirken statt überwältigend. Eleganz ist für dich etwas Leises.',
    fallbackReason:
      'Deine Angaben liegen nah beieinander. AURA 02 verbindet frische, florale und warme Elemente und ist deshalb eine ausgewogene erste Orientierung.',
    productSlug: 'aura-02-the-muse',
    colors: [
      { name: 'Dusty Rose', hex: '#D9A7B0' },
      { name: 'Rosé-Champagne', hex: '#E8C9BD' },
      { name: 'Soft Mauve', hex: '#B48DA0' },
    ],
    scene: {
      bg: '#F2E0DF',
      ink: '#17151A',
      muted: '#6A535A',
      aura: ['#DFA3AF', '#FCEDE9', '#B48DA0'],
      dark: false,
    },
    reasons: {
      floral: 'Jasmin, Rose und Pfingstrose bilden das florale Herz von AURA 02.',
      musk: 'Moschus gibt AURA 02 eine weiche, saubere Basis.',
      woody: 'Sandelholz gibt AURA 02 eine cremige, weiche Tiefe.',
      citrus: 'Bergamotte gibt AURA 02 einen frischen Auftakt.',
      sweet: 'Birne bringt eine leichte, fruchtige Süße in die Kopfnote.',
      'little-sweet': 'Ein wenig Süße: Birne macht AURA 02 weich, ohne schwer zu werden.',
      soft: 'Du möchtest weich und elegant wirken. AURA 02 ist auf genau diese Wirkung ausgelegt.',
      creative: 'Kreativ und ein wenig verträumt: Das ist der Charakter von AURA 02.',
      balanced: 'Wahrnehmbar, aber nicht dominant: So ist AURA 02 angelegt.',
      evening: 'AURA 02 passt zu Dinner, Dates und besonderen Momenten.',
      day: 'AURA 02 ist weich genug, um dich durch den Alltag zu begleiten.',
      romance: 'Deine Bildwelt Soft Romance spiegelt sich in der Rosé-Farbwelt von AURA 02.',
      modern: 'Klare Formen, weiche Blüten: AURA 02 ist die moderne Muse der Kollektion.',
    },
  },
  afterglow: {
    id: 'afterglow',
    name: 'The Afterglow',
    tagline: 'Warm, deep, magnetic.',
    message: 'You leave a feeling long after the moment ends.',
    description:
      'Du suchst Wärme und Tiefe: einen Duft mit Präsenz, der sich am Abend entfaltet und in Erinnerung bleibt, lange nachdem du den Raum verlassen hast.',
    fallbackReason:
      'Deine Angaben zeigen eine Tendenz zu Wärme und Tiefe. AURA 03 ist dafür der naheliegende Startpunkt.',
    productSlug: 'aura-03-the-afterglow',
    colors: [
      { name: 'Plum', hex: '#4C293F' },
      { name: 'Espresso', hex: '#3B2A24' },
      { name: 'Bronze', hex: '#A67C52' },
    ],
    scene: {
      bg: '#3A1F30',
      ink: '#F7F3EE',
      muted: '#D9C6CD',
      aura: ['#9A5A66', '#D29A62', '#6B3553'],
      dark: true,
    },
    reasons: {
      sweet: 'Vanille und Tonkabohne geben AURA 03 seine cremige Süße.',
      spicy: 'Rosa Pfeffer und Gewürznoten wärmen AURA 03 von Anfang an.',
      woody: 'Warme Hölzer tragen die Basis von AURA 03.',
      warm: 'Du suchst Wärme und Anziehung. AURA 03 setzt auf Amber, Vanille und Tonkabohne.',
      bold: 'Du magst Präsenz. AURA 03 ist der ausdrucksstärkste Duft der Kollektion.',
      mystery: 'Ein Hauch Geheimnis: Gewürze und warme Hölzer geben AURA 03 Tiefe.',
      evening: 'Für Dates, Events und besondere Abende ist AURA 03 gemacht.',
      floral: 'Ein warmes Herz aus Amber umhüllt die florale Seite deiner Auswahl.',
      musk: 'Die warme Basis von AURA 03 bleibt lange und nah auf der Haut.',
      'little-sweet': 'Die Süße von AURA 03 kommt aus Vanille und Tonkabohne und bleibt warm statt zuckrig.',
      midnight: 'Deine Bildwelt Midnight Velvet spiegelt sich in der Plum-Farbwelt von AURA 03.',
      creative: 'Rosa Pfeffer gibt AURA 03 einen ungewöhnlichen, hellen Funken.',
    },
  },
};
