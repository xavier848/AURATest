import { Link } from 'react-router-dom';
import { PARFUMS, SETS } from '../data/products';
import { useConsent } from '../lib/consent';

export function Footer() {
  const { openSettings } = useConsent();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="logo logo--light">
              AURA
            </Link>
            <p className="site-footer__claim">Find the scent that feels like you.</p>
            <p className="site-footer__note">
              Konzept-Prototyp. Alle Produkte, Preise und Duftbeschreibungen sind Beispieldaten und noch nicht
              lieferbar.
            </p>
          </div>

          <div className="site-footer__cols">
            <div>
              <h2 className="site-footer__heading">Shop</h2>
              <ul>
                <li>
                  <Link to="/shop">Alle Düfte</Link>
                </li>
                {[...PARFUMS, ...SETS].map((p) => (
                  <li key={p.id}>
                    <Link to={`/shop/${p.slug}`}>{p.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="site-footer__heading">AURA</h2>
              <ul>
                <li>
                  <Link to="/duftfinder">Discover Your AURA</Link>
                </li>
                <li>
                  <Link to="/philosophie">Philosophie</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/kontakt">Kontakt</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="site-footer__heading">Service</h2>
              <ul>
                <li>
                  <Link to="/versand">Versand &amp; Rückgabe</Link>
                </li>
                <li>
                  <Link to="/widerruf">Widerrufsbelehrung</Link>
                </li>
                <li>
                  <Link to="/agb">AGB</Link>
                </li>
                <li>
                  <Link to="/datenschutz">Datenschutz</Link>
                </li>
                <li>
                  <Link to="/impressum">Impressum</Link>
                </li>
                <li>
                  <button type="button" className="link-button" onClick={openSettings}>
                    Cookie-Einstellungen
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} AURA · The Art of Finding Your Scent</p>
          <p>Instagram &amp; TikTok starten mit dem Launch.</p>
        </div>
      </div>
    </footer>
  );
}
