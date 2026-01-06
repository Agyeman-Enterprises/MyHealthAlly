'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/lib/i18n/language-store';

/**
 * Language Provider Component
 * Updates HTML lang attribute based on user's language preference
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { uiLanguage } = useLanguageStore();

  useEffect(() => {
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = uiLanguage;
    }
  }, [uiLanguage]);

  return <>{children}</>;
}
