'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCurrentUserAndPatient, updateUserSettings } from '@/lib/supabase/queries-settings';

type Theme = 'light' | 'dark' | 'system';
type TextSize = 'small' | 'medium' | 'large';

export default function AppearancePage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userRecord } = await getCurrentUserAndPatient();
        setUserId(userRecord.id);
        const prefs = userRecord.appearance_preferences || {};
        setTheme(prefs.theme ?? 'system');
        setTextSize(prefs.textSize ?? 'medium');
        setHighContrast(prefs.highContrast ?? false);
        setReduceMotion(prefs.reduceMotion ?? false);
      } catch (err: unknown) {
        console.error('Error loading appearance settings', err);
        const message = err instanceof Error ? err.message : 'Unable to load appearance settings.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoading, router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const appearancePreferences = { theme, textSize, highContrast, reduceMotion };
      await updateUserSettings(userId, { appearancePreferences });
      setSuccess('Appearance settings saved.');
      
      // Trigger theme refresh by reloading page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      console.error('Error saving appearance settings', err);
      const message = err instanceof Error ? err.message : 'Unable to save appearance settings.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Appearance</h1>
        <p className="text-gray-600 mb-2">Customize how the app looks</p>
        {loading && <p className="text-sm text-gray-500 mb-4">Loading preferences…</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Theme</h2>
          <div className="grid grid-cols-3 gap-3">
            {[{ v: 'light', l: 'Light', i: '☀️' }, { v: 'dark', l: 'Dark', i: '🌙' }, { v: 'system', l: 'System', i: '💻' }].map((t) => (
              <button key={t.v} onClick={() => setTheme(t.v as Theme)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === t.v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300'}`}>
                <span className="text-2xl">{t.i}</span>
                <span className="text-sm font-medium">{t.l}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">Theme preference will be applied after saving. System theme follows your device settings.</p>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Text Size</h2>
          <div className="space-y-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button key={size} onClick={() => setTextSize(size)} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${textSize === size ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                <span className={`font-medium ${textSize === size ? 'text-primary-700' : 'text-gray-700'}`}>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                {textSize === size && <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              </button>
            ))}
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Accessibility</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">High Contrast</h3><p className="text-sm text-gray-500">Increase contrast for better visibility</p></div>
              <button onClick={() => setHighContrast(!highContrast)} className={`w-12 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-primary-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-navy-600">Reduce Motion</h3><p className="text-sm text-gray-500">Minimize animations and transitions</p></div>
              <button onClick={() => setReduceMotion(!reduceMotion)} className={`w-12 h-6 rounded-full transition-colors relative ${reduceMotion ? 'bg-primary-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${reduceMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </Card>

        <Button variant="primary" className="w-full" onClick={handleSave} isLoading={saving} disabled={loading || saving}>Save Preferences</Button>
      </main>
      <BottomNav />
    </div>
  );
}
