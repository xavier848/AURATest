import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './storage';

export interface ConsentState {
  analytics: boolean;
  decidedAt: string;
}

interface ConsentContextValue {
  consent: ConsentState | null;
  bannerOpen: boolean;
  decide: (analytics: boolean) => void;
  openSettings: () => void;
}

declare global {
  interface Window {
    auraEvents?: Record<string, unknown>[];
  }
}

const KEY = 'aura.consent.v1';
let analyticsAllowed = false;

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(() => readJSON<ConsentState | null>(KEY, null));
  const [bannerOpen, setBannerOpen] = useState(() => readJSON<ConsentState | null>(KEY, null) === null);

  // Synchron setzen, damit Events aus Kind-Effekten schon die aktuelle Entscheidung sehen.
  analyticsAllowed = consent?.analytics ?? false;

  const decide = useCallback((analytics: boolean) => {
    const next = { analytics, decidedAt: new Date().toISOString() };
    writeJSON(KEY, next);
    analyticsAllowed = analytics;
    setConsent(next);
    setBannerOpen(false);
  }, []);

  const openSettings = useCallback(() => setBannerOpen(true), []);

  const value = useMemo(
    () => ({ consent, bannerOpen, decide, openSettings }),
    [consent, bannerOpen, decide, openSettings],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent außerhalb von ConsentProvider');
  return ctx;
}

/**
 * Datenschutzfreundliche Analytics-Schnittstelle (Businessplan 8.6).
 * Ohne Einwilligung wird nichts erfasst. Im Prototyp landen Events nur lokal in
 * window.auraEvents; im Live-Shop wird hier das gewählte Analytics-Tool angebunden.
 */
export function track(event: string, data: Record<string, unknown> = {}): void {
  if (!analyticsAllowed) return;
  const entry = { event, ...data, at: new Date().toISOString() };
  window.auraEvents = [...(window.auraEvents ?? []), entry];
  if (import.meta.env.DEV) console.info('[AURA analytics]', entry);
}
