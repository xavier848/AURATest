type StoreKind = 'local' | 'session';

function getStore(kind: StoreKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Liest JSON aus dem Browser-Speicher. Fällt still zurück, wenn Speicher blockiert ist. */
export function readJSON<T>(key: string, fallback: T, kind: StoreKind = 'local'): T {
  try {
    const raw = getStore(kind)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, kind: StoreKind = 'local'): void {
  try {
    getStore(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // Privater Modus oder voller Speicher: Die Seite funktioniert trotzdem, nur ohne Zwischenspeicherung.
  }
}

export function removeKey(key: string, kind: StoreKind = 'local'): void {
  try {
    getStore(kind)?.removeItem(key);
  } catch {
    // siehe writeJSON
  }
}
