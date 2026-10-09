import { NavLink } from 'react-router-dom';
import { FREE_SHIPPING_FROM_CENTS, SHIPPING_CENTS } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { usePageMeta } from '../lib/usePageMeta';

export type LegalKey = 'impressum' | 'datenschutz' | 'widerruf' | 'versand' | 'agb';

interface LegalPage {
  title: string;
  nav: string;
  sections: { heading: string; body: string[] }[];
}

const PAGES: Record<LegalKey, LegalPage> = {
  impressum: {
    title: 'Impressum',
    nav: 'Impressum',
    sections: [
      {
        heading: 'Angaben gemäß § 5 DDG',
        body: ['[Firmenname und Rechtsform]', '[Straße und Hausnummer]', '[PLZ Ort]', 'Vertreten durch: [Name]'],
      },
      {
        heading: 'Kontakt',
        body: ['E-Mail: [Adresse folgt]', 'Telefon: [Nummer folgt]'],
      },
      {
        heading: 'Registereintrag und Umsatzsteuer',
        body: ['Registergericht und Registernummer: [folgt]', 'Umsatzsteuer-Identifikationsnummer: [folgt]'],
      },
      {
        heading: 'Verbraucherstreitbeilegung',
        body: ['[Angabe, ob AURA an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilnimmt.]'],
      },
    ],
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    nav: 'Datenschutz',
    sections: [
      {
        heading: 'Verantwortliche Stelle',
        body: ['[Name und Anschrift wie im Impressum, Kontakt für Datenschutzanfragen]'],
      },
      {
        heading: 'Was dieser Prototyp speichert',
        body: [
          'Warenkorb, Fortschritt im Duftfinder, dein letztes Ergebnis und deine Cookie-Entscheidung werden ausschließlich lokal in deinem Browser gespeichert (localStorage). Die Bestätigung einer Demo-Bestellung liegt nur für die aktuelle Sitzung im sessionStorage.',
          'Diese Speicherungen sind für die von dir gewünschten Funktionen erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Du kannst sie jederzeit über die Einstellungen deines Browsers löschen.',
        ],
      },
      {
        heading: 'Statistik',
        body: [
          'Anonyme Nutzungsstatistiken, etwa wie viele Personen den Duftfinder abschließen, erfassen wir nur mit deiner Einwilligung (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Im Prototyp werden diese Daten nicht übertragen. Deine Entscheidung kannst du jederzeit über „Cookie-Einstellungen“ im Footer ändern.',
        ],
      },
      {
        heading: 'Schriftarten',
        body: [
          'Alle Schriftarten werden von unserem eigenen Server ausgeliefert. Es besteht keine Verbindung zu Google Fonts oder anderen Schriftanbietern.',
        ],
      },
      {
        heading: 'Kontaktformular, Newsletter und Bestellung',
        body: [
          'Im Prototyp werden Eingaben in diesen Formularen nicht übertragen und nicht gespeichert. Für den Live-Shop werden hier Zweck, Rechtsgrundlage, Empfänger (zum Beispiel Zahlungs- und Versanddienstleister) und Speicherdauer ergänzt. Der Newsletter wird nur mit Double-Opt-in versendet.',
        ],
      },
      {
        heading: 'Deine Rechte',
        body: [
          'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO) sowie das Recht, eine erteilte Einwilligung zu widerrufen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren.',
        ],
      },
    ],
  },
  widerruf: {
    title: 'Widerrufsbelehrung',
    nav: 'Widerruf',
    sections: [
      {
        heading: 'Widerrufsrecht',
        body: [
          'Verbraucherinnen und Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen einen Vertrag zu widerrufen. [Vollständiger Text nach gesetzlichem Muster folgt.]',
        ],
      },
      {
        heading: 'Hinweis zu Kosmetikprodukten',
        body: [
          'Das Widerrufsrecht kann bei versiegelten Waren erlöschen, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde. Ob und wie das für Flakons und Duftproben gilt, wird vor dem Launch rechtlich geprüft.',
        ],
      },
      {
        heading: 'Widerruf erklären',
        body: [
          'Im Live-Shop stehen hier das Muster-Widerrufsformular und eine elektronische Widerrufsfunktion, wie sie für Online-Verträge seit dem 19. Juni 2026 vorgeschrieben ist.',
        ],
      },
    ],
  },
  versand: {
    title: 'Versand & Rückgabe',
    nav: 'Versand',
    sections: [
      {
        heading: 'Liefergebiet und Lieferzeit',
        body: [
          'Zum Start liefern wir innerhalb Deutschlands. Geplante Lieferzeit: 2–4 Werktage. Der Versanddienstleister wird vor dem Launch festgelegt.',
        ],
      },
      {
        heading: 'Versandkosten',
        body: [
          `Standardversand: ${formatPrice(SHIPPING_CENTS)}. Ab einem Bestellwert von ${formatPrice(FREE_SHIPPING_FROM_CENTS)} versenden wir kostenlos. Das sind Beispielwerte, die vor dem Launch mit echten Konditionen ersetzt werden.`,
          'Versandkosten weisen wir im Warenkorb und an der Kasse immer separat aus.',
        ],
      },
      {
        heading: 'Rücksendung',
        body: [
          'Informationen zur Rücksendung und zu den Kosten folgen mit der Wahl des Versanddienstleisters. Siehe auch die Widerrufsbelehrung.',
        ],
      },
    ],
  },
  agb: {
    title: 'Allgemeine Geschäftsbedingungen',
    nav: 'AGB',
    sections: [
      { heading: '1. Geltungsbereich', body: ['[Gilt für alle Bestellungen über den AURA Onlineshop.]'] },
      {
        heading: '2. Vertragsschluss',
        body: [
          '[Beschreibung des Bestellablaufs. Im Live-Shop schließt der Button „Zahlungspflichtig bestellen“ die Bestellung ab.]',
        ],
      },
      {
        heading: '3. Preise und Versandkosten',
        body: ['[Alle Preise inklusive gesetzlicher Umsatzsteuer, zuzüglich Versandkosten.]'],
      },
      {
        heading: '4. Zahlung und Lieferung',
        body: ['[Zahlungsarten und Lieferbedingungen folgen mit der Wahl der Anbieter.]'],
      },
      {
        heading: '5. Widerruf und Gewährleistung',
        body: ['[Verweis auf Widerrufsbelehrung und gesetzliche Mängelrechte.]'],
      },
    ],
  },
};

const ORDER: LegalKey[] = ['impressum', 'datenschutz', 'widerruf', 'versand', 'agb'];

export default function Legal({ page }: { page: LegalKey }) {
  const content = PAGES[page];
  usePageMeta(content.title);
  return (
    <section className="section section--tight legal">
      <div className="container legal__inner">
        <nav className="legal__nav" aria-label="Rechtliches">
          {ORDER.map((key) => (
            <NavLink key={key} to={`/${key}`} className="legal__link">
              {PAGES[key].nav}
            </NavLink>
          ))}
        </nav>
        <article className="legal__content">
          <p className="eyebrow">Rechtliches</p>
          <h1 className="h-xl">{content.title}</h1>
          <p className="notice">
            Platzhalter für den Prototyp. Vor dem Launch müssen alle Angaben vollständig ergänzt und von einer
            Fachperson geprüft werden.
          </p>
          {content.sections.map((section) => (
            <section key={section.heading} className="legal__section">
              <h2>{section.heading}</h2>
              {section.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </section>
  );
}
