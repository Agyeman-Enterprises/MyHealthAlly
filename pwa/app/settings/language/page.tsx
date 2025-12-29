'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient, updateUserSettings } from '@/lib/supabase/queries-settings';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ch', name: 'Chamorro', native: 'Chamoru' },
  { code: 'cuk', name: 'Chuukese', native: 'Chuuk' },
  { code: 'mh', name: 'Marshallese', native: 'Kajin M̧ajeļ' },
  { code: 'tl', name: 'Tagalog', native: 'Tagalog' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'es', name: 'Spanish', native: 'Español' },
];

export default function LanguagePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [selected, setSelected] = useState('en');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userRecord } = await getCurrentUserAndPatient();
        setUserId(userRecord.id);
        setSelected(userRecord.preferred_language || 'en');
      } catch (err: any) {
        console.error('Error loading language', err);
        setError(err.message || 'Unable to load language preference.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserSettings(userId, { preferredLanguage: selected, communicationLanguage: selected });
      setSuccess('Language preference saved.');
    } catch (err: any) {
      console.error('Error saving language', err);
      setError(err.message || 'Unable to save language preference.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Language</h1>
        <p className="text-gray-600 mb-2">Choose your preferred language for the app</p>
        {loading && <p className="text-sm text-gray-500 mb-4">Loading preference…</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

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
          Save Preference
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
