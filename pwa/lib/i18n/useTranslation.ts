/**
 * Translation Hook
 * Provides translation function based on current language preference
 */

import { useLanguageStore } from './language-store';
import { getTranslation, type TranslationKey } from './translations';

/**
 * Hook to get translation function for current language
 */
export function useTranslation() {
  const { uiLanguage } = useLanguageStore();
  
  const t = (key: TranslationKey): string => {
    return getTranslation(key, uiLanguage);
  };
  
  return { t, language: uiLanguage };
}
