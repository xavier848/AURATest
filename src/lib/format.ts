const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export const VAT_RATE = 0.19;

export function formatPrice(cents: number): string {
  return eur.format(cents / 100);
}

/** Grundpreis nach PAngV, bezogen auf 100 ml. */
export function unitPrice(cents: number, sizeMl: number): string {
  return `${eur.format(cents / sizeMl)} / 100 ml`;
}

/** Enthaltene Umsatzsteuer eines Bruttobetrags. */
export function includedVat(cents: number): number {
  return Math.round(cents - cents / (1 + VAT_RATE));
}
