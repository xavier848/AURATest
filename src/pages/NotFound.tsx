import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/usePageMeta';

export default function NotFound() {
  usePageMeta('Seite nicht gefunden');
  return (
    <section className="section not-found grain">
      <div className="container narrow">
        <p className="eyebrow">404</p>
        <h1 className="h-2xl">
          This page has <em>evaporated.</em>
        </h1>
        <p className="muted">Die Seite gibt es nicht oder nicht mehr. Vielleicht findest du hier, was du suchst:</p>
        <div className="empty-state__actions">
          <Link to="/" className="btn">
            Zur Startseite
          </Link>
          <Link to="/shop" className="btn btn--ghost">
            Zum Shop
          </Link>
          <Link to="/duftfinder" className="btn btn--ghost">
            Find my AURA
          </Link>
        </div>
      </div>
    </section>
  );
}
