import { useEffect } from 'react';

const DEFAULT_TITLE = 'AURA — The Art of Finding Your Scent';

export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · AURA` : DEFAULT_TITLE;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
