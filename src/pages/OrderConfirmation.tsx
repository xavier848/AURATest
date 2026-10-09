import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format';
import { readJSON } from '../lib/storage';
import { usePageMeta } from '../lib/usePageMeta';
import { ORDER_KEY, type DemoOrder } from './Checkout';

export default function OrderConfirmation() {
  usePageMeta('Bestellbestätigung');
  const order = readJSON<DemoOrder | null>(ORDER_KEY, null, 'session');

  if (!order) {
    return (
      <section className="section section--tight">
        <div className="container narrow">
          <p className="eyebrow">Bestellung</p>
          <h1 className="h-xl">Keine Bestellung gefunden.</h1>
          <p className="muted">Die Bestätigung wird nur in der aktuellen Browser-Sitzung angezeigt.</p>
          <Link to="/shop" className="btn">
            Zum Shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section confirmation grain">
      <div className="container narrow">
        <p className="eyebrow">Demo-Bestellung {order.number}</p>
        <h1 className="h-2xl">
          Thank you, <em>{order.firstName}.</em>
        </h1>
        <p className="notice">
          Das war eine Demo. Es wurde nichts bestellt, nichts berechnet und nichts versendet. Im Live-Shop bekämst du
          jetzt eine Bestellbestätigung an {order.email}.
        </p>

        <div className="confirmation__card">
          <ul className="summary__lines">
            {order.lines.map((l) => (
              <li key={l.name + l.variant}>
                <span>
                  {l.qty} × {l.name}
                  <span className="summary__variant">{l.variant}</span>
                </span>
                <span>{formatPrice(l.totalCents)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <div>
              <dt>Versand</dt>
              <dd>{order.shippingCents === 0 ? 'kostenlos' : formatPrice(order.shippingCents)}</dd>
            </div>
            <div className="totals__grand">
              <dt>Gesamt</dt>
              <dd>{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>
          <p className="fineprint">Lieferadresse: {order.address}</p>
        </div>

        <div className="empty-state__actions">
          <Link to="/" className="btn">
            Zur Startseite
          </Link>
          <Link to="/duftfinder" className="btn btn--ghost">
            Find my AURA
          </Link>
        </div>
      </div>
    </section>
  );
}
