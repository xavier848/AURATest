import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { PARFUMS, SETS, type Product } from '../data/products';
import { track } from '../lib/consent';
import { loadResult } from '../lib/quizStore';
import { usePageMeta } from '../lib/usePageMeta';

export default function Shop() {
  usePageMeta(
    'Shop All',
    'Alle AURA Düfte: The Glow, The Muse und The Afterglow als Eau de Parfum, dazu das Discovery Set und die Gift Experience.',
  );
  const saved = loadResult();

  const badgeFor = (product: Product) => {
    if (!saved || !product.archetype) return undefined;
    if (product.archetype === saved.primary) return 'Dein Match';
    if (product.archetype === saved.alternative) return 'Deine Alternative';
    return undefined;
  };

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Shop All</p>
          <h1 className="h-2xl">
            The <em>collection.</em>
          </h1>
          <p className="page-head__text">
            Drei Eau de Parfums mit eigener Duftwelt und zwei Sets, um sie in Ruhe zu entdecken. Alle Preise sind
            Testpreise im Prototyp.
          </p>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="edp-title">
        <div className="container">
          <div className="group-head">
            <h2 id="edp-title" className="h-lg">
              Eau de Parfum
            </h2>
            <p className="muted">Jeweils 30 ml und 50 ml</p>
          </div>
          <div className="product-grid">
            {PARFUMS.map((product, i) => (
              <Reveal key={product.id} delay={i * 90}>
                <ProductCard product={product} badge={badgeFor(product)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="quiz-banner grain">
        <div className="container quiz-banner__inner">
          <div>
            <p className="eyebrow">Nicht sicher?</p>
            <h2 className="h-lg">Finde in drei Minuten heraus, welcher Duft zu dir passt.</h2>
          </div>
          <Link to="/duftfinder" className="btn" onClick={() => track('quiz_cta_click', { placement: 'shop' })}>
            Find my AURA <ArrowRightIcon size={18} />
          </Link>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="sets-title">
        <div className="container">
          <div className="group-head">
            <h2 id="sets-title" className="h-lg">
              Sets
            </h2>
            <p className="muted">Erst testen, dann entscheiden</p>
          </div>
          <div className="product-grid product-grid--2">
            {SETS.map((product, i) => (
              <Reveal key={product.id} delay={i * 90}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
