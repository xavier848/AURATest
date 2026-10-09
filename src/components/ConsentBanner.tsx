import { Link } from 'react-router-dom';
import { useConsent } from '../lib/consent';

export function ConsentBanner() {
  const { bannerOpen, decide, consent } = useConsent();
  if (!bannerOpen) return null;
  return (
    <section className="consent" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-text">
      <h2 id="consent-title" className="consent__title">
        Deine Privatsphäre
      </h2>
      <p id="consent-text" className="consent__text">
        Wir speichern nur, was die Seite braucht: deinen Warenkorb und deinen Fortschritt im Duftfinder, beides lokal in
        deinem Browser. Anonyme Nutzungsstatistiken erfassen wir nur, wenn du zustimmst.{' '}
        <Link to="/datenschutz">Mehr erfahren</Link>
      </p>
      {consent && <p className="consent__current">Aktuell: Statistik {consent.analytics ? 'erlaubt' : 'abgelehnt'}.</p>}
      <div className="consent__actions">
        <button type="button" className="btn btn--light btn--sm" onClick={() => decide(false)}>
          Nur notwendige
        </button>
        <button type="button" className="btn btn--light btn--sm" onClick={() => decide(true)}>
          Statistik erlauben
        </button>
      </div>
    </section>
  );
}
