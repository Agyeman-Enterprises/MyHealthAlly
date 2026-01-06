'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { RequirePractice } from '@/components/RequirePractice';
import { PharmacyAutocomplete, type Pharmacy } from '@/components/pharmacy/PharmacyAutocompleteSimple';
import { translateText } from '@/lib/utils/translate';
import { VoiceConsole } from '@/components/voice/VoiceConsole';

export default function RefillPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [notes, setNotes] = useState('');
  const [detectedLang, setDetectedLang] = useState('en');
  const [submitting, setSubmitting] = useState(false);
  const [showVoice, setShowVoice] = useState(true);

  if (isLoading) {
    return null;
  }

  function RefillPageInner() {
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) {
      alert('Please select a pharmacy');
      return;
    }
    setSubmitting(true);
    try {
      const { detectedLang: lang } = await translateText(notes, 'en');
      setDetectedLang(lang);
      await new Promise(r => setTimeout(r, 800));
      alert(`Refill request submitted to ${pharmacy.name}! (lang: ${lang}) Your care team will process it within 1-2 business days.`);
      router.push('/medications');
    } finally {
      setSubmitting(false);
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
        {showVoice && (
          <div className="mb-4">
            <VoiceConsole
              title="Voice log refill (auto-translate to English)"
              onComplete={({ translated, detectedLang: lang }) => {
                setDetectedLang(lang);
                setNotes((prev) => (prev ? `${prev} ${translated}`.trim() : translated));
                setShowVoice(false);
              }}
              onCancel={() => setShowVoice(false)}
            />
          </div>
        )}
        <Card>
          <h1 className="text-xl font-bold text-navy-600 mb-4">Request Medication Refill</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PharmacyAutocomplete
              value={pharmacy}
              onChange={setPharmacy}
              label="Preferred Pharmacy"
              required
            />
            <div>
              <TextArea
                label="Additional Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions or requests..."
              />
              <p className="text-xs text-gray-500 mt-2">Tap the microphone icon to record voice input. Real-time transcription in your language.</p>
              {detectedLang && <p className="text-xs text-gray-500 mt-1">Detected language: {detectedLang}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={submitting}>Submit Request</Button>
            </div>
          </form>
        </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <RequirePractice featureName="Medication Refills">
      <RefillPageInner />
    </RequirePractice>
  );
}
