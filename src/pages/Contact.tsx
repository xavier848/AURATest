import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/usePageMeta';

type Field = 'name' | 'email' | 'topic' | 'message' | 'privacy';

export default function Contact() {
  usePageMeta('Kontakt', 'Fragen zu AURA, dem Duftfinder oder einer Kooperation? Schreib uns.');
  const [form, setForm] = useState({ name: '', email: '', topic: 'duftfinder', message: '', privacy: false });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) next.name = 'Bitte gib deinen Namen ein.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    if (form.message.trim().length < 10) next.message = 'Deine Nachricht braucht mindestens 10 Zeichen.';
    if (!form.privacy) next.privacy = 'Bitte bestätige den Datenschutzhinweis.';
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSent(true);
  };

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Kontakt</p>
          <h1 className="h-2xl">
            Let’s <em>talk.</em>
          </h1>
          <p className="page-head__text">
            Fragen zum Duftfinder, Feedback zum Prototyp oder Interesse an einer Creator-Kooperation? Wir freuen uns auf
            deine Nachricht.
          </p>
        </div>
      </section>
      <section className="section section--tight">
        <div className="container contact">
          {sent ? (
            <div className="contact__done" role="status">
              <p className="h-lg">Danke, {form.name.trim()}.</p>
              <p className="muted">
                Im Prototyp wird deine Nachricht nicht versendet. Im Live-Shop geht sie direkt an unser Team, und wir
                antworten innerhalb von zwei Werktagen.
              </p>
              <Link to="/" className="btn">
                Zur Startseite
              </Link>
            </div>
          ) : (
            <form className="contact__form" onSubmit={submit} noValidate>
              <div className="form-grid">
                <div className="field field--half">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                <div className="field field--half">
                  <label htmlFor="contact-email">E-Mail-Adresse</label>
                  <input
                    id="contact-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div className="field">
                  <label htmlFor="contact-topic">Worum geht es?</label>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  >
                    <option value="duftfinder">Duftfinder &amp; Ergebnis</option>
                    <option value="produkte">Düfte &amp; Discovery Set</option>
                    <option value="kooperation">Creator-Kooperation</option>
                    <option value="sonstiges">Etwas anderes</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="contact-message">Nachricht</label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <p className="form-error">{errors.message}</p>}
                </div>
              </div>
              <label className="check" htmlFor="contact-privacy">
                <input
                  id="contact-privacy"
                  type="checkbox"
                  checked={form.privacy}
                  onChange={(e) => setForm({ ...form, privacy: e.target.checked })}
                />
                <span>
                  Ich bin einverstanden, dass meine Angaben zur Beantwortung meiner Anfrage verwendet werden. Mehr in
                  der <Link to="/datenschutz">Datenschutzerklärung</Link>.
                </span>
              </label>
              {errors.privacy && <p className="form-error">{errors.privacy}</p>}
              <button type="submit" className="btn">
                Nachricht senden
              </button>
            </form>
          )}

          <aside className="contact__aside">
            <div>
              <h2 className="contact__heading">Antwortzeit</h2>
              <p className="muted">Geplant: innerhalb von zwei Werktagen.</p>
            </div>
            <div>
              <h2 className="contact__heading">Schnelle Antworten</h2>
              <p className="muted">
                Viele Fragen zu Duftfinder, Versand und Inhaltsstoffen beantworten wir in den <Link to="/faq">FAQ</Link>
                .
              </p>
            </div>
            <div>
              <h2 className="contact__heading">Adresse &amp; E-Mail</h2>
              <p className="muted">Folgen mit der Gründung. Bis dahin gilt das Impressum als Platzhalter.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
