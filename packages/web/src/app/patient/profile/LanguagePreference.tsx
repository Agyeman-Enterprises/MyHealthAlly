'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { fetchAPI } from '@/lib/utils';
import { Languages, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
}

interface LanguagePreferences {
  preferredLanguage: string | null;
  lastDetectedLanguage: string | null;
  availableLanguages: Language[];
}

export function LanguagePreference() {
  const [preferences, setPreferences] = useState<LanguagePreferences | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/patients/me/language');
      setPreferences(data);
      setSelectedLanguage(data.preferredLanguage || data.lastDetectedLanguage || 'en');
    } catch (err: any) {
      setError(err.message || 'Failed to load language preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedLanguage) {
      setError('Please select a language');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await fetchAPI('/patients/me/language', {
        method: 'POST',
        body: JSON.stringify({ preferredLanguage: selectedLanguage }),
      });
      setSaved(true);
      await loadPreferences();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save language preference');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="text-body text-slate-600">
            Loading language preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="text-body text-red-600">
            Failed to load language preferences
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedLanguageName = preferences.availableLanguages.find(
    (lang) => lang.code === selectedLanguage,
  )?.name || selectedLanguage.toUpperCase();

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-teal-600" />
          <CardTitle className="text-h3 text-slate-900">
            Language Preference
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language-select" className="text-body text-slate-900">
            What is your preferred language for your care?
          </Label>
          <p className="text-small text-slate-600">
            We&apos;ll use this language for your care plans, visit summaries, messages, and instructions.
          </p>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger
              id="language-select"
              className="bg-slate-50"
            >
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {/* COFA / Micronesian Languages - Prominently listed first */}
              {preferences.availableLanguages
                .filter((lang) => ['chk', 'pon', 'kos', 'yap', 'mh', 'pau'].includes(lang.code))
                .map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} {lang.code === 'chk' && '⭐'}
                  </SelectItem>
                ))}
              {/* Separator */}
              {preferences.availableLanguages.some((lang) => ['chk', 'pon', 'kos', 'yap', 'mh', 'pau'].includes(lang.code)) && (
                <div className="px-2 py-1 text-caption text-slate-600">
                  ──────────────
                </div>
              )}
              {/* Other languages */}
              {preferences.availableLanguages
                .filter((lang) => !['chk', 'pon', 'kos', 'yap', 'mh', 'pau'].includes(lang.code))
                .map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {preferences.lastDetectedLanguage && 
         preferences.lastDetectedLanguage !== 'en' && 
         !preferences.preferredLanguage && (
          <div
            className="p-3 rounded-lg"
            className="p-3 rounded-lg bg-teal-50 border border-teal-600"
          >
            <p className="text-small text-slate-900">
              <strong>Tip:</strong> We noticed you&apos;ve been using{' '}
              {preferences.availableLanguages.find((l) => l.code === preferences.lastDetectedLanguage)?.name || 
               preferences.lastDetectedLanguage.toUpperCase()}. 
              You can select it above to receive all communications in that language.
            </p>
          </div>
        )}

        {error && (
          <div
            className="p-3 rounded-lg"
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600"
          >
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3 rounded-lg flex items-center gap-2 bg-teal-50 border border-teal-600 text-teal-600">
            <Check className="w-4 h-4" />
            <span className="text-small">Language preference saved successfully!</span>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !selectedLanguage}
          >
            {saving ? 'Saving...' : 'Save Language Preference'}
          </Button>
        </div>

        {preferences.preferredLanguage && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50">
            <p className="text-small font-medium mb-2 text-slate-900">
              Current Setting:
            </p>
            <p className="text-body text-slate-600">
              Your care plans, visit summaries, and messages will be displayed in{' '}
              <strong className="text-slate-900">
                {preferences.availableLanguages.find((l) => l.code === preferences.preferredLanguage)?.name || 
                 preferences.preferredLanguage.toUpperCase()}
              </strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

