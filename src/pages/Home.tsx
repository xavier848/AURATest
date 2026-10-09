import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flacon } from '../components/Flacon';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';
import { MoodArt } from '../components/MoodArt';
import { NewsletterForm } from '../components/NewsletterForm';
import { ProductCard } from '../components/ProductCard';
import { ProductStage } from '../components/ProductStage';
import { Reveal } from '../components/Reveal';
import { ARCHETYPES } from '../data/archetypes';
import { PARFUMS, getProductById } from '../data/products';
import { getQuestion, type Art } from '../data/quiz';
import { track } from '../lib/consent';
import { formatPrice } from '../lib/format';
import { loadResult } from '../lib/quizStore';
import { usePageMeta } from '../lib/usePageMeta';

const universe = getQuestion('universe');
const families = getQuestion('families');
const feeling = getQuestion('feeling');

const STEPS: { title: string; text: string; art: Art }[] = [
  {
    title: 'Discover',
    text: 'Erzähl uns von deinem Stil, deiner Stimmung und den Düften, die du liebst.',
    art: universe.answers[0].art as Art,
  },
  {
    title: 'Reveal',
    text: 'Lerne dein persönliches Duftprofil kennen, mit Archetyp, Farbwelt und einer ehrlichen Begründung.',
    art: feeling.answers[2].art as Art,
  },
  {
    title: 'Experience',
    text: 'Entdecke deinen Match und teste ihn im Discovery Set, bevor du dich für deinen Signature-Duft entscheidest.',
    art: families.answers[1].art as Art,
  },
];

const PREVIEW_IDS = ['golden-morning', 'midnight-velvet'];

export default function Home() {
  usePageMeta(
    '',
    'AURA hilft dir, einen Duft zu finden, der sich wie du anfühlt: mit einem persönlichen Duftfinder, drei Eau de Parfums und einem Discovery Set.',
  );
  const navigate = useNavigate();
  const [pick, setPick] = useState<string | null>(null);
  const saved = loadResult();
  const discovery = getProductById('discovery-set');

  const startQuiz = (placement: string) => {
    track('quiz_cta_click', { placement });
    navigate(pick ? `/duftfinder?start=1&universe=${pick}` : '/duftfinder?start=1');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">Eau de Parfum · N°01 — N°03</p>
            <h1 className="hero__title">
              Find the scent <br className="hide-sm" />
              that feels <em>like&nbsp;you.</em>
            </h1>
            <p className="hero__lead">A more personal way to discover fragrance.</p>
            <p className="hero__text">
              Beantworte ein paar Fragen zu deinem Stil, deiner Stimmung und deinen Lieblingsnoten. AURA zeigt dir das
              Duftprofil, das am besten zu dir passt, und erklärt dir, warum.
            </p>
            <div className="hero__actions">
              <Link to="/duftfinder" className="btn" onClick={() => track('quiz_cta_click', { placement: 'hero' })}>
                Discover your AURA
              </Link>
              <Link to="/shop" className="btn btn--ghost">
                Explore the collection
              </Link>
            </div>
            <ul className="hero__meta">
              <li>2–3 Minuten</li>
              <li>Ohne Anmeldung</li>
              <li>Persönliches Duftprofil</li>
            </ul>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <div className="hero__aura" />
            <div className="hero__flacon">
              <div className="hero__floor" />
              <Flacon
                animated
                reflection
                liquid={['#F3DFB8', '#D9B57A']}
                metal="gold"
                subtitle="Eau de Parfum"
                name="Find your scent"
                label="AURA Flakon"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section experience" aria-labelledby="experience-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The AURA Experience</p>
            <h2 id="experience-title" className="h-xl">
              From answers <em>to fragrance.</em>
            </h2>
          </div>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 120} className="step">
                  <span className="step__num">0{i + 1}</span>
                  <div className="step__art grain">
                    <MoodArt art={step.art} />
                  </div>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section collection" aria-labelledby="collection-title">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">The Collection</p>
              <h2 id="collection-title" className="h-xl">
                Meet the <em>collection.</em>
              </h2>
            </div>
            <p className="section-head__text">
              Drei Eau de Parfums, drei Duftprofile, drei Farbwelten. Frisch und hell, weich und floral, warm und tief.
            </p>
          </div>
          <div className="product-grid">
            {PARFUMS.map((product, i) => (
              <Reveal key={product.id} delay={i * 100}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section discovery-teaser" aria-labelledby="teaser-title">
        <div className="container discovery-teaser__inner">
          <div className="discovery-teaser__copy">
            <p className="eyebrow">Interactive Scent Discovery</p>
            <h2 id="teaser-title" className="h-xl">
              Your scent. <em>Your rules.</em>
            </h2>
            <p className="discovery-teaser__question">Which world feels most like you?</p>
            <p className="muted">
              Wähle eine Welt und starte damit direkt in den Duftfinder. Deine Bildwelt prägt später die Gestaltung
              deines Ergebnisses.
            </p>
            <div className="discovery-teaser__actions">
              <button type="button" className="btn" onClick={() => startQuiz('teaser')}>
                Find my AURA
              </button>
              {saved && (
                <Link to={`/duftfinder/ergebnis?r=${saved.code}`} className="text-link">
                  Dein letztes Ergebnis: {ARCHETYPES[saved.primary].name}
                  <ArrowRightIcon size={16} />
                </Link>
              )}
            </div>
          </div>
          <div className="discovery-teaser__cards" role="group" aria-label="Beispielfrage: Wähle deine Welt">
            {PREVIEW_IDS.map((id) => {
              const answer = universe.answers.find((a) => a.id === id);
              if (!answer?.art) return null;
              const selected = pick === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`answer answer--preview ${selected ? 'is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => setPick(selected ? null : id)}
                >
                  <span className="answer__art grain">
                    <MoodArt art={answer.art} />
                  </span>
                  <span className="answer__text">
                    <span className="answer__label">{answer.label}</span>
                    <span className="answer__desc">{answer.description}</span>
                  </span>
                  <span className="answer__check" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="philosophy-band grain" aria-labelledby="philosophy-title">
        <div className="container philosophy-band__inner">
          <p className="eyebrow">Our Philosophy</p>
          <h2 id="philosophy-title" className="philosophy-band__title">
            Fragrance is <em>personal.</em>
          </h2>
          <p className="philosophy-band__text">
            Wie du einen Duft erlebst, ist einzigartig. AURA hilft dir, Duft über deine Vorlieben, deine Rituale und das
            Gefühl zu entdecken, das du erzeugen möchtest.
          </p>
          <Link to="/philosophie" className="text-link">
            Unsere Philosophie <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      {discovery && (
        <section className="discovery-set" aria-labelledby="discovery-title">
          <div className="container discovery-set__inner">
            <Reveal className="discovery-set__media">
              <ProductStage product={discovery} />
            </Reveal>
            <div className="discovery-set__copy">
              <p className="eyebrow eyebrow--light">The Discovery Set</p>
              <h2 id="discovery-title" className="h-xl">
                Three scents. <em>One personal discovery.</em>
              </h2>
              <p>
                Entdecke die Kollektion auf deiner eigenen Haut, bevor du dich für eine Vollgröße entscheidest. Jede
                Probe ist einem Duftprofil zugeordnet, eine Karte erklärt die Duftnoten.
              </p>
              <ul className="ticks">
                {discovery.contents?.map((item) => (
                  <li key={item}>
                    <CheckIcon size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="discovery-set__buy">
                <span className="discovery-set__price">{formatPrice(discovery.variants[0].priceCents)}</span>
                <Link to="/shop/discovery-set" className="btn btn--light">
                  Explore the discovery set
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section proof" aria-labelledby="proof-title">
        <div className="container proof__inner">
          <div>
            <p className="eyebrow">Stimmen</p>
            <h2 id="proof-title" className="h-xl">
              Real voices <em>only.</em>
            </h2>
          </div>
          <div className="proof__body">
            <p>
              Nach dem Launch zeigen wir hier verifizierte Kundenbewertungen, echte Creator-Erfahrungen, Kundenfotos und
              ehrliches Feedback zum Duftfinder. Bis dahin bleibt dieser Platz bewusst leer.
            </p>
            <ul className="pledges">
              <li>
                <span className="pledges__num">Nur</span> verifizierte Käufe
              </li>
              <li>
                <span className="pledges__num">Klar</span> gekennzeichnete Kooperationen
              </li>
              <li>
                <span className="pledges__num">Keine</span> erfundenen Zahlen
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="newsletter" aria-labelledby="newsletter-title">
        <div className="container newsletter__inner">
          <div>
            <p className="eyebrow eyebrow--light">Newsletter</p>
            <h2 id="newsletter-title" className="h-xl">
              Enter the <em>AURA universe.</em>
            </h2>
            <p className="newsletter__lead">Discover new scents, rituals and stories.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
