/**
 * Language Store (Multilingual Support)
 * MHA supports ANY language - translation handled server-side by SoloPractice
 * This store manages patient's preferred language and UI language
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';

export type LanguageCode = string; // ISO 639-1 code (e.g., 'en', 'ko', 'es', 'ch', etc.)

interface LanguageState {
  preferredLanguage: LanguageCode;
  uiLanguage: LanguageCode;
  detectedLanguage: LanguageCode | null;
  isLoading: boolean;
  
  // Actions
  setPreferredLanguage: (lang: LanguageCode) => Promise<void>;
  setUILanguage: (lang: LanguageCode) => void;
  setDetectedLanguage: (lang: LanguageCode | null) => void;
  syncWithDatabase: () => Promise<void>;
  detectLanguageFromText: (text: string) => Promise<LanguageCode | null>;
}

const DEFAULT_LANGUAGE = 'en';

export const useLanguageStore = create<LanguageState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, _get) => ({
      preferredLanguage: DEFAULT_LANGUAGE,
      uiLanguage: DEFAULT_LANGUAGE,
      detectedLanguage: null,
      isLoading: false,

      setPreferredLanguage: async (lang: LanguageCode) => {
        set({ preferredLanguage: lang, isLoading: true });
        
        try {
          // Update in database
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userRecord } = await supabase
              .from('users')
              .select('id, patients(id)')
              .eq('supabase_auth_id', user.id)
              .single();

            if (userRecord) {
              // Update user's preferred language
              await supabase
                .from('users')
                .update({ preferred_language: lang })
                .eq('id', userRecord.id);

              // Update patient's communication language if patient record exists
              if (userRecord.patients && Array.isArray(userRecord.patients) && userRecord.patients.length > 0) {
                const patientId = userRecord.patients[0]?.id;
                await supabase
                  .from('patients')
                  .update({ 
                    // Note: patients table doesn't have language field directly
                    // It's stored in users table
                  })
                  .eq('id', patientId);
              }
            }
          }
        } catch (error) {
          console.error('Error updating preferred language:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setUILanguage: (lang: LanguageCode) => {
        set({ uiLanguage: lang });
      },

      setDetectedLanguage: (lang: LanguageCode | null) => {
        set({ detectedLanguage: lang });
      },

      syncWithDatabase: async () => {
        set({ isLoading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userRecord } = await supabase
              .from('users')
              .select('preferred_language, communication_language')
              .eq('supabase_auth_id', user.id)
              .single();

            if (userRecord) {
              set({
                preferredLanguage: userRecord.preferred_language || DEFAULT_LANGUAGE,
                uiLanguage: userRecord.communication_language || userRecord.preferred_language || DEFAULT_LANGUAGE,
              });
            }
          }
        } catch (error) {
          console.error('Error syncing language from database:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      detectLanguageFromText: async (_text: string) => {
        // Simple language detection (can be enhanced with API)
        // For now, return null - SoloPractice will detect server-side
        // This is a placeholder for future client-side detection
        return null;
      },
    }),
    {
      name: 'mha-language-storage',
      partialize: (state) => ({
        preferredLanguage: state.preferredLanguage,
        uiLanguage: state.uiLanguage,
        detectedLanguage: state.detectedLanguage,
      }),
    }
  )
);

/**
 * Get language code for API requests
 * MHA sends this to SoloPractice for translation
 */
export function getLanguageForAPI(): LanguageCode {
  const store = useLanguageStore.getState();
  return store.preferredLanguage || DEFAULT_LANGUAGE;
}

/**
 * Get detected language from voice/text input
 * This is sent to SoloPractice for translation
 */
export function getDetectedLanguage(): LanguageCode | null {
  return useLanguageStore.getState().detectedLanguage;
}

/**
 * Set detected language from voice/text input
 * Called after transcription detects the language
 */
export function setDetectedLanguage(lang: LanguageCode | null): void {
  useLanguageStore.getState().setDetectedLanguage(lang);
}

