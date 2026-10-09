import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FREE_SHIPPING_FROM_CENTS, shippingFor, useCart } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { CloseIcon } from './Icons';
import { ProductStage } from './ProductStage';
import { QuantityStepper } from './QuantityStepper';

export function CartDrawer() {
  const { lines, subtotalCents, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const shipping = shippingFor(subtotalCents);
  const missing = FREE_SHIPPING_FROM_CENTS - subtotalCents;

  useEffect(() => {
    document.body.classList.toggle('is-locked', drawerOpen);
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`drawer ${drawerOpen ? 'is-open' : ''}`} aria-hidden={!drawerOpen} inert={!drawerOpen}>
      <div className="drawer__backdrop" onClick={closeDrawer} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer__head">
          <h2 id="drawer-title" className="drawer__title">
            Warenkorb
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="icon-btn"
            onClick={closeDrawer}
            aria-label="Warenkorb schließen"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <p className="drawer__empty-title">Dein Warenkorb ist leer.</p>
            <p>Nicht sicher, wo du anfangen sollst? Der Duftfinder hilft in zwei bis drei Minuten.</p>
            <Link to="/duftfinder" className="btn btn--block" onClick={closeDrawer}>
              Find my AURA
            </Link>
            <Link to="/shop" className="btn btn--ghost btn--block" onClick={closeDrawer}>
              Zum Shop
            </Link>
          </div>
        ) : (
          <>
            {missing > 0 && (
              <p className="drawer__shipping-hint">Noch {formatPrice(missing)} bis zum kostenlosen Versand.</p>
            )}
            <ul className="drawer__lines">
              {lines.map((line) => (
                <li key={line.product.id + line.variant.id} className="cart-line cart-line--compact">
                  <Link
                    to={`/shop/${line.product.slug}`}
                    className="cart-line__media"
                    onClick={closeDrawer}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <ProductStage product={line.product} />
                  </Link>
                  <div className="cart-line__info">
                    <Link to={`/shop/${line.product.slug}`} className="cart-line__name" onClick={closeDrawer}>
                      {line.product.name}
                    </Link>
                    <span className="cart-line__variant">{line.variant.label}</span>
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
            <div className="drawer__foot">
              <dl className="totals">
                <div>
                  <dt>Zwischensumme</dt>
                  <dd>{formatPrice(subtotalCents)}</dd>
                </div>
                <div>
                  <dt>Versand</dt>
                  <dd>{shipping === 0 ? 'kostenlos' : formatPrice(shipping)}</dd>
                </div>
              </dl>
              <Link to="/kasse" className="btn btn--block" onClick={closeDrawer}>
                Zur Kasse
              </Link>
              <Link to="/warenkorb" className="btn btn--ghost btn--block" onClick={closeDrawer}>
                Warenkorb ansehen
              </Link>
              <p className="fineprint">Demo-Checkout: Es wird nichts berechnet und nichts versendet.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
