import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shippingFor, useCart } from '../lib/cart';
import { track } from '../lib/consent';
import { formatPrice, includedVat } from '../lib/format';
import { writeJSON } from '../lib/storage';
import { usePageMeta } from '../lib/usePageMeta';

export const ORDER_KEY = 'aura.order.v1';

export interface DemoOrder {
  number: string;
  createdAt: string;
  firstName: string;
  email: string;
  address: string;
  lines: { name: string; variant: string; qty: number; totalCents: number }[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

type Field = 'email' | 'firstName' | 'lastName' | 'street' | 'zip' | 'city';
type FormState = Record<Field, string> & { terms: boolean };

const FIELDS: {
  id: Field;
  label: string;
  autoComplete: string;
  type?: string;
  inputMode?: 'email' | 'numeric';
  half?: boolean;
}[] = [
  { id: 'email', label: 'E-Mail-Adresse', autoComplete: 'email', type: 'email', inputMode: 'email' },
  { id: 'firstName', label: 'Vorname', autoComplete: 'given-name', half: true },
  { id: 'lastName', label: 'Nachname', autoComplete: 'family-name', half: true },
  { id: 'street', label: 'Straße und Hausnummer', autoComplete: 'street-address' },
  { id: 'zip', label: 'PLZ', autoComplete: 'postal-code', inputMode: 'numeric', half: true },
  { id: 'city', label: 'Ort', autoComplete: 'address-level2', half: true },
];

function validate(form: FormState): Partial<Record<Field | 'terms', string>> {
  const errors: Partial<Record<Field | 'terms', string>> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
    errors.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
  if (!form.firstName.trim()) errors.firstName = 'Bitte gib deinen Vornamen ein.';
  if (!form.lastName.trim()) errors.lastName = 'Bitte gib deinen Nachnamen ein.';
  if (!/\d/.test(form.street) || form.street.trim().length < 4) errors.street = 'Bitte gib Straße und Hausnummer ein.';
  if (!/^\d{5}$/.test(form.zip.trim())) errors.zip = 'Die PLZ hat in Deutschland fünf Ziffern.';
  if (!form.city.trim()) errors.city = 'Bitte gib deinen Ort ein.';
  if (!form.terms) errors.terms = 'Bitte bestätige AGB und Widerrufsbelehrung.';
  return errors;
}

export default function Checkout() {
  usePageMeta('Kasse');
  const navigate = useNavigate();
  const { lines, subtotalCents, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    email: '',
    firstName: '',
    lastName: '',
    street: '',
    zip: '',
    city: '',
    terms: false,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [submitted, setSubmitted] = useState(false);
  const shipping = shippingFor(subtotalCents);
  const total = subtotalCents + shipping;

  const update = (field: Field | 'terms', value: string | boolean) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    const order: DemoOrder = {
      number: `AURA-DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString(),
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      address: `${form.street.trim()}, ${form.zip.trim()} ${form.city.trim()}`,
      lines: lines.map((l) => ({
        name: l.product.fullName,
        variant: l.variant.label,
        qty: l.qty,
        totalCents: l.totalCents,
      })),
      subtotalCents,
      shippingCents: shipping,
      totalCents: total,
    };
    writeJSON(ORDER_KEY, order, 'session');
    track('demo_order_complete', { totalCents: total });
    clear();
    navigate('/bestellung');
  };

  if (lines.length === 0) {
    return (
      <section className="section section--tight">
        <div className="container narrow">
          <p className="eyebrow">Kasse</p>
          <h1 className="h-xl">Dein Warenkorb ist leer.</h1>
          <p className="muted">Lege zuerst einen Duft oder ein Set in den Warenkorb.</p>
          <Link to="/shop" className="btn">
            Zum Shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--tight checkout">
      <div className="container">
        <div className="page-title">
          <p className="eyebrow">Kasse · Demo</p>
          <h1 className="h-2xl">
            Almost <em>yours.</em>
          </h1>
          <p className="notice">
            Das ist ein Demo-Checkout. Du kannst den Ablauf testen, aber es wird nichts bestellt, berechnet oder
            versendet. Deine Eingaben verlassen deinen Browser nicht.
          </p>
        </div>

        <div className="checkout__layout">
          <form className="checkout__form" onSubmit={submit} noValidate>
            <fieldset className="form-section">
              <legend>Kontakt &amp; Lieferadresse</legend>
              <div className="form-grid">
                {FIELDS.map((f) => (
                  <div key={f.id} className={`field ${f.half ? 'field--half' : ''}`}>
                    <label htmlFor={`checkout-${f.id}`}>{f.label}</label>
                    <input
                      id={`checkout-${f.id}`}
                      type={f.type ?? 'text'}
                      inputMode={f.inputMode}
                      autoComplete={f.autoComplete}
                      value={form[f.id]}
                      onChange={(e) => update(f.id, e.target.value)}
                      aria-invalid={Boolean(errors[f.id])}
                      aria-describedby={errors[f.id] ? `checkout-${f.id}-error` : undefined}
                    />
                    {errors[f.id] && (
                      <p id={`checkout-${f.id}-error`} className="form-error">
                        {errors[f.id]}
                      </p>
                    )}
                  </div>
                ))}
                <div className="field">
                  <label htmlFor="checkout-country">Land</label>
                  <select id="checkout-country" autoComplete="country-name" defaultValue="DE">
                    <option value="DE">Deutschland</option>
                  </select>
                  <p className="field__hint">Zum Start liefern wir nur innerhalb Deutschlands.</p>
                </div>
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Versand</legend>
              <label className="option-card is-selected">
                <input type="radio" name="shipping" defaultChecked className="sr-only" />
                <span>
                  <span className="option-card__title">Standardversand</span>
                  <span className="option-card__text">2–4 Werktage (geplant)</span>
                </span>
                <span className="option-card__price">{shipping === 0 ? 'kostenlos' : formatPrice(shipping)}</span>
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>Zahlung</legend>
              <label className="option-card is-selected">
                <input type="radio" name="payment" defaultChecked className="sr-only" />
                <span>
                  <span className="option-card__title">Demo-Zahlung</span>
                  <span className="option-card__text">
                    Im Live-Shop folgt hier ein sicherer Zahlungsanbieter. Im Prototyp wird nichts berechnet.
                  </span>
                </span>
              </label>
            </fieldset>

            <label className="check" htmlFor="checkout-terms">
              <input
                id="checkout-terms"
                type="checkbox"
                checked={form.terms}
                onChange={(e) => update('terms', e.target.checked)}
              />
              <span>
                Ich habe die <Link to="/agb">AGB</Link> und die <Link to="/widerruf">Widerrufsbelehrung</Link> gelesen.
                Hinweise zum Datenschutz findest du in der <Link to="/datenschutz">Datenschutzerklärung</Link>.
              </span>
            </label>
            {errors.terms && <p className="form-error">{errors.terms}</p>}

            <button type="submit" className="btn btn--block checkout__submit">
              Demo-Bestellung abschließen
            </button>
          </form>

          <aside className="summary" aria-labelledby="checkout-summary">
            <h2 id="checkout-summary" className="summary__title">
              Deine Bestellung
            </h2>
            <ul className="summary__lines">
              {lines.map((l) => (
                <li key={l.product.id + l.variant.id}>
                  <span>
                    {l.qty} × {l.product.name}
                    <span className="summary__variant">{l.variant.label}</span>
                  </span>
                  <span>{formatPrice(l.totalCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="totals">
              <div>
                <dt>Zwischensumme</dt>
                <dd>{formatPrice(subtotalCents)}</dd>
              </div>
              <div>
                <dt>Versand</dt>
                <dd>{shipping === 0 ? 'kostenlos' : formatPrice(shipping)}</dd>
              </div>
              <div className="totals__grand">
                <dt>Gesamt</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="fineprint">inkl. {formatPrice(includedVat(total))} MwSt. (19 %)</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
