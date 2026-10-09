import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/usePageMeta';

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Der Duftfinder',
    items: [
      {
        q: 'Wie funktioniert der Duftfinder?',
        a: 'Du beantwortest zehn kurze Fragen zu Wirkung, Bildwelt, Duftfamilien, Anlässen, Intensität und Noten, die du meiden möchtest. Jede Antwort vergibt Punkte an unsere drei Duftprofile. Auf der Ergebnisseite siehst du genau, wie dein Ergebnis zustande gekommen ist.',
      },
      {
        q: 'Ist das ein wissenschaftlicher Persönlichkeitstest?',
        a: 'Nein. Die AURA-Archetypen sind Markenprofile. Der Duftfinder empfiehlt Düfte anhand deiner Vorlieben, er misst nicht deine Persönlichkeit.',
      },
      {
        q: 'Muss ich mich anmelden?',
        a: 'Nein. Der Duftfinder funktioniert ohne Konto und ohne E-Mail-Adresse. Dein Fortschritt und dein Ergebnis bleiben in deinem Browser.',
      },
      {
        q: 'Was passiert, wenn ich bestimmte Noten nicht mag?',
        a: 'Duftrichtungen, die du meiden möchtest, wiegen stärker als alle ästhetischen Angaben. Einen Duft, der sie enthält, empfehlen wir dir nach Möglichkeit nicht.',
      },
    ],
  },
  {
    title: 'Düfte & Produkte',
    items: [
      {
        q: 'Riecht ein Duft auf jeder Haut gleich?',
        a: 'Nein. Hautchemie, Temperatur und Pflegeprodukte beeinflussen, wie sich ein Duft entwickelt. Deshalb gibt es das Discovery Set.',
      },
      {
        q: 'Was ist im Discovery Set enthalten?',
        a: 'Drei Duftproben, je eine von AURA 01, 02 und 03, eine Karte mit den Duftbeschreibungen und ein QR-Code zu deiner AURA Identity.',
      },
      {
        q: 'Welche Inhaltsstoffe enthalten die Düfte?',
        a: 'Die vollständige INCI-Liste mit allen kennzeichnungspflichtigen Duftallergenen veröffentlichen wir nach Freigabe der Rezepturen und der Sicherheitsbewertung nach EU-Kosmetikverordnung.',
      },
    ],
  },
  {
    title: 'Bestellung & Versand',
    items: [
      {
        q: 'Kann ich schon bestellen?',
        a: 'Noch nicht. Diese Website ist ein Konzept-Prototyp. Warenkorb und Checkout kannst du ausprobieren, es wird aber nichts berechnet und nichts versendet.',
      },
      {
        q: 'Wohin wird geliefert?',
        a: 'Zum Start ist der Versand innerhalb Deutschlands geplant. Weitere Länder in Europa sollen folgen.',
      },
      {
        q: 'Was kostet der Versand?',
        a: 'Geplant sind 4,90 € innerhalb Deutschlands, ab 50 € Bestellwert kostenlos. Die Versandkosten weisen wir im Warenkorb immer separat aus.',
      },
    ],
  },
];

export default function Faq() {
  usePageMeta('FAQ', 'Antworten zum AURA Duftfinder, zu den Düften, dem Discovery Set, Versand und Datenschutz.');
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">FAQ</p>
          <h1 className="h-2xl">
            Questions, <em>answered.</em>
          </h1>
        </div>
      </section>
      <section className="section section--tight">
        <div className="container faq">
          {GROUPS.map((group) => (
            <div key={group.title} className="faq__group">
              <h2 className="faq__title">{group.title}</h2>
              <div className="accordion">
                {group.items.map((item) => (
                  <details key={item.q}>
                    <summary>{item.q}</summary>
                    <div className="accordion__body">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
          <div className="faq__more">
            <p className="muted">Deine Frage ist nicht dabei?</p>
            <Link to="/kontakt" className="btn btn--ghost">
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
