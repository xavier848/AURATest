import { Link } from 'react-router-dom';
import { MoodArt } from '../components/MoodArt';
import { Reveal } from '../components/Reveal';
import { getQuestion, type Art } from '../data/quiz';
import { usePageMeta } from '../lib/usePageMeta';

const art = (question: Parameters<typeof getQuestion>[0], answerId: string) =>
  getQuestion(question).answers.find((a) => a.id === answerId)?.art as Art;

const PILLARS = [
  {
    title: 'Visual Scent Identity',
    text: 'Jedes Ergebnis bekommt einen Archetyp, eine eigene Farbwelt und ein Profil deiner Duftvorlieben. Dein Duft wird sichtbar, bevor du ihn riechst.',
    art: art('universe', 'soft-romance'),
  },
  {
    title: 'Transparentes Matching',
    text: 'Wir zeigen dir, welche Antworten zu deiner Empfehlung geführt haben. Mit Punkten, ohne Blackbox.',
    art: art('universe', 'modern-muse'),
  },
  {
    title: 'Discovery before commitment',
    text: 'Mit dem Discovery Set testest du alle drei Düfte auf deiner Haut, bevor du eine ganze Flasche kaufst.',
    art: art('families', 'clean-musky'),
  },
  {
    title: 'The AURA Universe',
    text: 'Duftfinder, Ergebnis, Produkt und Verpackung erzählen dieselbe Geschichte. Ein Gefühl, das sich durchzieht.',
    art: art('universe', 'midnight-velvet'),
  },
];

export default function About() {
  usePageMeta(
    'Philosophie',
    'AURA makes fragrance personal. Warum wir Düfte über Vorlieben, Rituale und Gefühle empfehlen und nicht über Bestsellerlisten.',
  );
  return (
    <>
      <section className="page-head page-head--large">
        <div className="container">
          <p className="eyebrow">Our Philosophy</p>
          <h1 className="h-hero">
            AURA makes fragrance <em>personal.</em>
          </h1>
          <div className="about-intro">
            <p className="about-intro__lead">
              Nicht nur: Welches Parfum riecht gut? Sondern: Wie möchte ich mich fühlen, wie möchte ich wahrgenommen
              werden und welcher Duft passt zu dieser Seite von mir?
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tight about-problem">
        <div className="container about-problem__inner">
          <div>
            <p className="eyebrow">Warum AURA</p>
            <h2 className="h-xl">
              Too many bottles, <em>too little guidance.</em>
            </h2>
          </div>
          <div className="about-problem__text">
            <p>
              Der Parfummarkt bietet eine riesige Auswahl. Trotzdem wissen viele Menschen nicht, welche Duftfamilie,
              Intensität oder Komposition zu ihnen passt. Am Ende stehen Blindkäufe, die im Schrank verschwinden.
            </p>
            <ul className="question-list">
              <li>Soll ich einen süßen, frischen, blumigen oder holzigen Duft wählen?</li>
              <li>Welcher Duft passt zu meinem Alltag?</li>
              <li>Möchte ich dezent, elegant, sinnlich oder auffällig wirken?</li>
              <li>Wie finde ich ein Parfum, ohne zahlreiche Flaschen blind zu kaufen?</li>
            </ul>
            <p>AURA übersetzt diese Fragen in eine einfache, visuelle und persönliche Auswahl.</p>
          </div>
        </div>
      </section>

      <section className="section pillars-section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Was uns unterscheidet</p>
            <h2 className="h-xl">
              Four ideas, <em>one feeling.</em>
            </h2>
          </div>
          <div className="pillars">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 80} className="pillar">
                <div className="pillar__art grain">
                  <MoodArt art={pillar.art} />
                </div>
                <div>
                  <h3 className="pillar__title">{pillar.title}</h3>
                  <p className="pillar__text">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight honesty">
        <div className="container honesty__inner">
          <div>
            <p className="eyebrow">Unser Versprechen</p>
            <h2 className="h-xl">
              Honest by <em>design.</em>
            </h2>
          </div>
          <dl className="honesty__list">
            <div>
              <dt>Kein Persönlichkeitstest im wissenschaftlichen Sinn</dt>
              <dd>
                Der Duftfinder empfiehlt Duftprofile anhand deiner Angaben. Er misst nicht deine Persönlichkeit und weiß
                nicht, wie ein Duft auf deiner Haut riecht.
              </dd>
            </div>
            <div>
              <dt>Keine erfundenen Stimmen</dt>
              <dd>Bewertungen, Creator-Erfahrungen und Zahlen zeigen wir erst, wenn es sie wirklich gibt.</dd>
            </div>
            <div>
              <dt>Realistische Angaben</dt>
              <dd>Haltbarkeit und Intensität beschreiben wir erst, wenn wir sie mit echten Mustern getestet haben.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="closing grain">
        <div className="container closing__inner">
          <blockquote className="closing__quote">
            <p>
              AURA is not about telling people who they are. It’s about helping them discover the scent that feels like
              them.
            </p>
          </blockquote>
          <Link to="/duftfinder" className="btn">
            Discover your AURA
          </Link>
        </div>
      </section>
    </>
  );
}
