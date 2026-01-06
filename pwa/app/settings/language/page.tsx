'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/i18n/language-store';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient, updateUserSettings } from '@/lib/supabase/queries-settings';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ch', name: 'Chamorro', native: 'Chamoru' },
  { code: 'chu', name: 'Chuukese', native: 'Chuuk' },
  { code: 'mh', name: 'Marshallese', native: 'Kajin M̧ajeļ' },
  { code: 'fil', name: 'Tagalog', native: 'Tagalog' },
  { code: 'es', name: 'Spanish', native: 'Español' },
];


export default function LanguagePage() {
  const router = useRouter();
  const { isLoading: authLoading } = useRequireAuth();
  const { updateUser } = useAuthStore();
  const { setPreferredLanguage, setUILanguage, syncWithDatabase } = useLanguageStore();
  const { t } = useTranslation();
  const [selected, setSelected] = useState('en');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userRecord } = await getCurrentUserAndPatient();
        setUserId(userRecord.id);
        const lang = userRecord.preferred_language || 'en';
        setSelected(lang);
        // Sync with language store
        await syncWithDatabase();
      } catch (err: unknown) {
        console.error('Error loading language', err);
        const message = err instanceof Error ? err.message : 'Unable to load language preference.';
        setError(message);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [authLoading, router, syncWithDatabase]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Update database
      await updateUserSettings(userId, { preferredLanguage: selected, communicationLanguage: selected });
      
      // Update language store
      await setPreferredLanguage(selected);
      setUILanguage(selected);
      
      // Update auth store
      updateUser({ preferredLanguage: selected });
      
      setSuccess('Language preference saved.');
      
      // Trigger page refresh to apply language changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      console.error('Error saving language', err);
      const message = err instanceof Error ? err.message : 'Unable to save language preference.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">{t('language.title')}</h1>
        <p className="text-gray-600 mb-2">{t('language.description')}</p>
        {loading && <p className="text-sm text-gray-500 mb-4">{t('common.loading')}</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success || t('language.saved')}</p>}

        <Card className="mb-6 bg-primary-50 border-primary-200">
          <p className="text-sm text-navy-600">
            <strong>💬 Unlimited Translation:</strong> Messages support any language. This setting controls the app interface language.
          </p>
        </Card>

        <Card className="space-y-2 p-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                selected === lang.code ? 'bg-primary-100 border-2 border-primary-500' : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div>
                <span className="font-medium text-navy-600">{lang.name}</span>
                <span className="text-gray-500 ml-2">({lang.native})</span>
              </div>
              {selected === lang.code && (
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </Card>

        <Button variant="primary" className="w-full mt-6" onClick={handleSave} isLoading={saving} disabled={loading || saving}>
          {t('language.save')}
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
