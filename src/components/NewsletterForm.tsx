import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim()))
      return setError('Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.');
    if (!consent) return setError('Bitte bestätige, dass du den Newsletter erhalten möchtest.');
    setError('');
    setDone(true);
  };

  if (done) {
    return (
      <div className="newsletter__done" role="status">
        <p className="newsletter__done-title">Danke für dein Interesse.</p>
        <p>
          Im Live-Shop bekämst du jetzt eine E-Mail, mit der du deine Anmeldung bestätigst (Double-Opt-in). Im Prototyp
          wurde nichts gespeichert und nichts versendet.
        </p>
      </div>
    );
  }

  return (
    <form className="newsletter__form" onSubmit={submit} noValidate>
      <div className="newsletter__row">
        <label htmlFor="newsletter-email" className="sr-only">
          E-Mail-Adresse
        </label>
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Deine E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error) && !EMAIL.test(email.trim())}
          aria-describedby={error ? 'newsletter-error' : undefined}
        />
        <button type="submit" className="btn btn--light">
          Anmelden
        </button>
      </div>
      <label className="check check--light" htmlFor="newsletter-consent">
        <input
          id="newsletter-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Ich möchte etwa einmal im Monat den AURA Newsletter mit neuen Düften, Ritualen und Geschichten erhalten.
          Abmeldung jederzeit über den Link in jeder E-Mail. Details in der{' '}
          <Link to="/datenschutz">Datenschutzerklärung</Link>.
        </span>
      </label>
      {error && (
        <p id="newsletter-error" className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
