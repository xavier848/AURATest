import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';
import { NotesPyramid } from '../components/NotesPyramid';
import { ProductCard } from '../components/ProductCard';
import { ProductStage } from '../components/ProductStage';
import { QuantityStepper } from '../components/QuantityStepper';
import { ARCHETYPES } from '../data/archetypes';
import { PARFUMS, getProductById, getProductBySlug, productForArchetype, type Product } from '../data/products';
import { FREE_SHIPPING_FROM_CENTS, SHIPPING_CENTS, useCart } from '../lib/cart';
import { track } from '../lib/consent';
import { formatPrice, unitPrice } from '../lib/format';
import { loadResult } from '../lib/quizStore';
import { usePageMeta } from '../lib/usePageMeta';
import NotFound from './NotFound';

export default function ProductPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  if (!product) return <NotFound />;
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  usePageMeta(product.fullName, `${product.character} ${product.forWhom}`);
  const [params] = useSearchParams();
  const [variantId, setVariantId] = useState(
    () => product.variants.find((v) => v.id === params.get('v'))?.id ?? product.variants[0].id,
  );
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const discovery = getProductById('discovery-set');
  const others = PARFUMS.filter((p) => p.id !== product.id).slice(0, 2);

  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track('product_view', { productId: product.id });
  }, [product.id]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.fullName,
    description: product.description,
    brand: { '@type': 'Brand', name: 'AURA' },
    category: product.kind === 'parfum' ? 'Eau de Parfum' : 'Duftset',
    offers: product.variants.map((v) => ({
      '@type': 'Offer',
      name: v.label,
      price: (v.priceCents / 100).toFixed(2),
      priceCurrency: 'EUR',
      // Prototyp: noch nicht bestellbar
      availability: 'https://schema.org/OutOfStock',
    })),
  };

  return (
    <>
      <section className="pdp">
        <div className="container pdp__inner">
          <div className="pdp__media">
            <ProductStage product={product} reflection={product.kind === 'parfum'} />
          </div>

          <div className="pdp__info">
            <nav className="breadcrumb" aria-label="Brotkrumen">
              <Link to="/shop">Shop</Link>
              <span aria-hidden="true">/</span>
              <span>{product.kind === 'parfum' ? 'Eau de Parfum' : 'Sets'}</span>
            </nav>
            <p className="eyebrow">{product.number ? `AURA N°${product.number} · Eau de Parfum` : 'AURA · Set'}</p>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__character">{product.character}</p>

            <div className="pdp__price">
              <span className="pdp__amount">{formatPrice(variant.priceCents)}</span>
              <span className="pdp__price-meta">
                {variant.sizeMl
                  ? `${variant.label} · Grundpreis ${unitPrice(variant.priceCents, variant.sizeMl)}`
                  : variant.label}
              </span>
              <span className="pdp__price-meta">
                inkl. MwSt., zzgl. <Link to="/versand">Versand</Link>
              </span>
            </div>

            {product.variants.length > 1 && (
              <fieldset className="variant-picker">
                <legend>Füllmenge</legend>
                <div className="variant-picker__options">
                  {product.variants.map((v) => (
                    <label key={v.id} className={`variant ${v.id === variantId ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        className="sr-only"
                        name="variant"
                        value={v.id}
                        checked={v.id === variantId}
                        onChange={() => setVariantId(v.id)}
                      />
                      <span className="variant__size">{v.label}</span>
                      <span className="variant__price">{formatPrice(v.priceCents)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="pdp__buy">
              <QuantityStepper value={qty} onChange={setQty} label="Menge" />
              <button
                type="button"
                className="btn pdp__add"
                onClick={() => {
                  add(product.id, variant.id, qty);
                  setQty(1);
                }}
              >
                In den Warenkorb
              </button>
            </div>
            <p className="fineprint">
              Prototyp: Warenkorb und Checkout funktionieren, eine echte Bestellung ist noch nicht möglich.
            </p>

            <p className="pdp__description">{product.description}</p>

            {product.notes && (
              <>
                <h2 className="pdp__subhead">Duftnoten</h2>
                <NotesPyramid notes={product.notes} />
              </>
            )}
            {product.contents && (
              <>
                <h2 className="pdp__subhead">Enthalten</h2>
                <ul className="ticks ticks--dark">
                  {product.contents.map((item) => (
                    <li key={item}>
                      <CheckIcon size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="accordion">
              {product.intensity && (
                <details>
                  <summary>Intensität &amp; Anlässe</summary>
                  <div className="accordion__body">
                    <div className="intensity" aria-label={`Geplante Intensität: ${product.intensity.label}`}>
                      {[1, 2, 3].map((n) => (
                        <span key={n} className={n <= (product.intensity?.level ?? 0) ? 'is-on' : ''} />
                      ))}
                      <span className="intensity__label">{product.intensity.label}</span>
                    </div>
                    <p>
                      Geplant für: {product.occasions?.join(', ')}. Intensität und Anlässe sind Zielwerte aus dem
                      Duftbriefing. Haltbarkeit und Projektion testen wir vor dem Launch mit echten Mustern und
                      beschreiben sie dann realistisch.
                    </p>
                  </div>
                </details>
              )}
              <details>
                <summary>Produktinformationen &amp; Inhaltsstoffe</summary>
                <div className="accordion__body">
                  <p>
                    {product.kind === 'parfum'
                      ? `Eau de Parfum, erhältlich in ${product.variants.map((v) => v.label).join(' und ')}. Duftnoten und Konzentration werden mit dem Hersteller abgestimmt.`
                      : 'Die Duftproben enthalten die drei Eau de Parfums der Kollektion. Die Probengröße wird mit dem Hersteller festgelegt.'}
                  </p>
                  <p>
                    Die vollständige Liste der Inhaltsstoffe (INCI) mit allen kennzeichnungspflichtigen Duftallergenen
                    folgt nach Freigabe der Rezeptur und der Sicherheitsbewertung nach EU-Kosmetikverordnung.
                  </p>
                </div>
              </details>
              <details>
                <summary>Lieferung &amp; Rückgabe</summary>
                <div className="accordion__body">
                  <p>
                    Geplant: Versand innerhalb Deutschlands in 2–4 Werktagen. Versandkosten{' '}
                    {formatPrice(SHIPPING_CENTS)}, ab {formatPrice(FREE_SHIPPING_FROM_CENTS)} kostenlos (Beispielwerte).
                  </p>
                  <p>
                    Mehr dazu unter <Link to="/versand">Versand &amp; Rückgabe</Link> und in der{' '}
                    <Link to="/widerruf">Widerrufsbelehrung</Link>.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <MatchBand product={product} />

      {product.kind === 'parfum' && discovery && (
        <section className="section section--tight">
          <div className="container">
            <Link to="/shop/discovery-set" className="alt-card">
              <span className="alt-card__media">
                <ProductStage product={discovery} />
              </span>
              <span className="alt-card__body">
                <span className="eyebrow">Discovery before commitment</span>
                <span className="alt-card__name">Erst testen, dann entscheiden.</span>
                <span className="alt-card__text">
                  Probiere {product.name} zusammen mit den beiden anderen Düften im Discovery Set für{' '}
                  {formatPrice(discovery.variants[0].priceCents)}.
                </span>
              </span>
              <span className="alt-card__arrow" aria-hidden="true">
                <ArrowRightIcon size={20} />
              </span>
            </Link>
          </div>
        </section>
      )}

      <section className="section section--tight pdp-extra">
        <div className="container pdp-extra__inner">
          <div>
            <h2 className="h-lg">Häufige Fragen</h2>
            <div className="accordion">
              <details>
                <summary>Riecht der Duft auf jeder Haut gleich?</summary>
                <div className="accordion__body">
                  <p>
                    Nein. Hautchemie, Temperatur und Pflegeprodukte verändern, wie sich ein Duft entwickelt. Deshalb
                    empfehlen wir, neue Düfte zuerst mit dem Discovery Set auf der eigenen Haut zu testen.
                  </p>
                </div>
              </details>
              <details>
                <summary>Wie lange hält der Duft?</summary>
                <div className="accordion__body">
                  <p>
                    Das testen wir vor dem Launch mit echten Mustern. Erst dann nennen wir Haltbarkeit und Projektion,
                    und zwar realistisch.
                  </p>
                </div>
              </details>
              <details>
                <summary>Kann ich den Duft schon bestellen?</summary>
                <div className="accordion__body">
                  <p>
                    Noch nicht. Diese Website ist ein Konzept-Prototyp. Du kannst Warenkorb und Checkout ausprobieren,
                    es wird aber nichts berechnet und nichts versendet.
                  </p>
                </div>
              </details>
            </div>
            <Link to="/faq" className="text-link">
              Alle Fragen ansehen <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="reviews-empty">
            <h2 className="h-lg">Bewertungen</h2>
            <p className="muted">
              Noch keine Bewertungen. Nach dem Launch erscheinen hier ausschließlich Bewertungen aus verifizierten
              Käufen.
            </p>
          </div>
        </div>
      </section>

      {product.kind === 'parfum' && (
        <section className="section section--tight more-scents" aria-labelledby="more-title">
          <div className="container">
            <div className="group-head">
              <h2 id="more-title" className="h-lg">
                Die anderen Düfte
              </h2>
            </div>
            <div className="product-grid product-grid--2">
              {others.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

function MatchBand({ product }: { product: Product }) {
  const saved = loadResult();
  const resultLink = saved ? `/duftfinder/ergebnis?r=${saved.code}` : '/duftfinder';

  let eyebrow = 'Your AURA match';
  let text: string;
  let primaryLink: { to: string; label: string };

  if (!saved) {
    text =
      product.kind === 'parfum'
        ? `Passt ${product.name} zu dir? Der Duftfinder sagt es dir in 2–3 Minuten und erklärt dir, warum.`
        : 'Finde vorab heraus, welcher der drei Düfte am besten zu dir passt.';
    primaryLink = { to: '/duftfinder', label: 'Find my AURA' };
  } else {
    const primaryName = ARCHETYPES[saved.primary].name;
    if (product.archetype === saved.primary) {
      eyebrow = 'Dein AURA-Match';
      text = `Laut deinem Duftfinder-Ergebnis ist ${product.name} der Duft, der am besten zu dir passt.`;
    } else if (product.archetype === saved.alternative) {
      eyebrow = 'Deine Alternative';
      text = `${product.name} ist deine Alternative. Dein Haupt-Match ist ${primaryName}.`;
    } else if (product.archetype) {
      text = `Dein Duftfinder-Ergebnis zeigt eher in Richtung ${primaryName}. ${product.name} passt weniger zu deinen Angaben.`;
    } else {
      text = `Im Set steckt auch dein Match ${primaryName}, zusammen mit den beiden anderen Düften.`;
    }
    primaryLink = { to: resultLink, label: 'Mein Ergebnis ansehen' };
  }

  const showMatchProduct = saved && product.archetype && product.archetype !== saved.primary;

  return (
    <section className="match-band grain">
      <div className="container match-band__inner">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <p className="match-band__text">{text}</p>
        </div>
        <div className="match-band__actions">
          <Link to={primaryLink.to} className="btn">
            {primaryLink.label}
          </Link>
          {showMatchProduct && saved && (
            <Link to={`/shop/${productForArchetype(saved.primary).slug}`} className="btn btn--ghost">
              Zu {ARCHETYPES[saved.primary].name}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
