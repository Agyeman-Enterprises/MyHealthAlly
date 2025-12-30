'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { translateText } from '@/lib/utils/translate';
import { VoiceConsole } from '@/components/voice/VoiceConsole';

export default function RefillPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [pharmacy, setPharmacy] = useState('');
  const [notes, setNotes] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [submitting, setSubmitting] = useState(false);
  const [showVoice, setShowVoice] = useState(true);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { detectedLang: lang } = await translateText(notes, 'en');
      setDetectedLang(lang);
      await new Promise(r => setTimeout(r, 800));
      alert(`Refill request submitted! (lang: ${lang}) Your care team will process it within 1-2 business days.`);
      router.push('/medications');
    } finally {
      setSubmitting(false);
    }
  };

  const startDictation = () => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined' &&
      ((window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
        (window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
    if (!SpeechRecognitionCtor) {
      alert('Voice input not supported in this browser.');
      return;
    }
    try {
      const recognition = new (SpeechRecognitionCtor as {
        new (): {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: unknown) => void) | null;
          onerror: ((event: { error?: string }) => void) | null;
          onend: (() => void) | null;
        };
      })();
      const browserLang = typeof navigator !== 'undefined' && typeof navigator.language === 'string' ? navigator.language : 'en-US';
      recognition.lang = browserLang;
      recognition.interimResults = false;
      recognition.continuous = true;
      setIsDictating(true);
      let sessionTranscript = '';
      recognition.onresult = (event) => {
        const evt = event as { resultIndex: number; results: Array<unknown> };
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          const res = evt.results[i] as unknown as { [key: number]: { transcript: string }; isFinal?: boolean };
          const first = res?.[0];
          if (!first?.transcript) continue;
          sessionTranscript += `${first.transcript} `;
        }
      };
      recognition.onerror = () => {
        setIsDictating(false);
      };
      recognition.onend = () => {
        setIsDictating(false);
        const finalTranscript = sessionTranscript.trim();
        if (!finalTranscript) return;
        setNotes((prev) => (prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript));
      };
      recognition.start();
    } catch (err) {
      setIsDictating(false);
      alert(err instanceof Error ? err.message : 'Unable to start voice input.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {showVoice && (
          <div className="mb-4">
            <VoiceConsole
              title="Voice log refill (auto-translate Vietnamese → English)"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pharmacy</label>
              <select value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400">
                <option value="">Select pharmacy</option>
                <option value="cvs">CVS Pharmacy - Tamuning</option>
                <option value="walgreens">Walgreens - Dededo</option>
                <option value="costco">Costco Pharmacy</option>
                <option value="other">Other (specify in notes)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special instructions or requests..." className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-primary-400" />
              <div className="flex items-center gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={startDictation} disabled={isDictating}>
                  {isDictating ? 'Listening…' : 'Voice log'}
                </Button>
                <p className="text-xs text-gray-500">Speak your request; we can transcribe and translate.</p>
                <span className="text-xs text-gray-500">Detected: {detectedLang || 'en'}</span>
              </div>
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
