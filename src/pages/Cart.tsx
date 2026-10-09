import { Link } from 'react-router-dom';
import { ProductStage } from '../components/ProductStage';
import { QuantityStepper } from '../components/QuantityStepper';
import { FREE_SHIPPING_FROM_CENTS, shippingFor, useCart } from '../lib/cart';
import { formatPrice, includedVat, unitPrice } from '../lib/format';
import { usePageMeta } from '../lib/usePageMeta';

export default function Cart() {
  usePageMeta('Warenkorb');
  const { lines, subtotalCents, setQty, remove } = useCart();
  const shipping = shippingFor(subtotalCents);
  const total = subtotalCents + shipping;
  const missing = FREE_SHIPPING_FROM_CENTS - subtotalCents;

  return (
    <section className="section section--tight cart-page">
      <div className="container">
        <div className="page-title">
          <p className="eyebrow">Warenkorb</p>
          <h1 className="h-2xl">
            Your <em>selection.</em>
          </h1>
        </div>

        {lines.length === 0 ? (
          <div className="empty-state">
            <p className="h-lg">Dein Warenkorb ist leer.</p>
            <p className="muted">Entdecke die Kollektion oder lass dir vom Duftfinder einen Duft empfehlen.</p>
            <div className="empty-state__actions">
              <Link to="/shop" className="btn">
                Zum Shop
              </Link>
              <Link to="/duftfinder" className="btn btn--ghost">
                Find my AURA
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-lines">
              {lines.map((line) => (
                <li key={line.product.id + line.variant.id} className="cart-line">
                  <Link to={`/shop/${line.product.slug}`} className="cart-line__media" tabIndex={-1} aria-hidden="true">
                    <ProductStage product={line.product} />
                  </Link>
                  <div className="cart-line__info">
                    <Link to={`/shop/${line.product.slug}`} className="cart-line__name">
                      {line.product.fullName}
                    </Link>
                    <span className="cart-line__variant">
                      {line.variant.label} · {formatPrice(line.variant.priceCents)}
                      {line.variant.sizeMl ? ` · ${unitPrice(line.variant.priceCents, line.variant.sizeMl)}` : ''}
                    </span>
                    <div className="cart-line__controls">
                      <QuantityStepper
                        value={line.qty}
                        min={0}
                        label={`Menge ${line.product.name}`}
                        onChange={(qty) => setQty(line.productId, line.variantId, qty)}
                      />
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => remove(line.productId, line.variantId)}
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                  <span className="cart-line__total">{formatPrice(line.totalCents)}</span>
                </li>
              ))}
            </ul>

            <aside className="summary" aria-labelledby="summary-title">
              <h2 id="summary-title" className="summary__title">
                Übersicht
              </h2>
              <dl className="totals">
                <div>
                  <dt>Zwischensumme</dt>
                  <dd>{formatPrice(subtotalCents)}</dd>
                </div>
                <div>
                  <dt>Versand (Deutschland)</dt>
                  <dd>{shipping === 0 ? 'kostenlos' : formatPrice(shipping)}</dd>
                </div>
                <div className="totals__grand">
                  <dt>Gesamt</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
              <p className="fineprint">inkl. {formatPrice(includedVat(total))} MwSt. (19 %)</p>
              {missing > 0 && <p className="summary__hint">Noch {formatPrice(missing)} bis zum kostenlosen Versand.</p>}
              <Link to="/kasse" className="btn btn--block">
                Zur Kasse
              </Link>
              <Link to="/shop" className="btn btn--ghost btn--block">
                Weiter einkaufen
              </Link>
              <p className="fineprint">Demo-Checkout: Es wird nichts berechnet und nichts versendet.</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
