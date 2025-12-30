'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { translateText } from '@/lib/utils/translate';

const recipients = [
  { id: 'care-team', name: 'Care Team', desc: 'General questions and concerns' },
  { id: 'dr-smith', name: 'Dr. Smith', desc: 'Your primary care physician' },
  { id: 'nurse', name: 'Nursing Staff', desc: 'Clinical questions' },
  { id: 'billing', name: 'Billing Department', desc: 'Payment and insurance' },
  { id: 'scheduling', name: 'Scheduling', desc: 'Appointments' },
];

export default function NewMessagePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [form, setForm] = useState({ recipient: '', subject: '', message: '' });
  const [isDictating, setIsDictating] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string>('en');
  const [sending, setSending] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient || !form.subject || !form.message) {
      alert('Please fill in all fields');
      return;
    }
    setSending(true);
    try {
      const { detectedLang: lang } = await translateText(form.message, 'en');
      setDetectedLang(lang);
      // TODO: send message to SoloPractice with source + translated text
      await new Promise((r) => setTimeout(r, 800));
      alert(`Message sent! (lang: ${lang}) You will receive a response within 24-48 hours.`);
      router.push('/messages');
    } finally {
      setSending(false);
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
      recognition.onerror = (e) => {
        console.error('Voice input error', e);
        setIsDictating(false);
      };
      recognition.onend = () => {
        setIsDictating(false);
        const finalTranscript = sessionTranscript.trim();
        if (!finalTranscript) return;
        setForm((prev) => ({
          ...prev,
          message: prev.message ? `${prev.message} ${finalTranscript}`.trim() : finalTranscript,
        }));
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
        <DisclaimerBanner variant="compact" />
        
        <Card>
          <h1 className="text-xl font-bold text-navy-600 mb-4">New Message</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
              <select value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" required>
                <option value="">Select recipient</option>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} - {r.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your question" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} placeholder="Type your message here..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" required />
              <div className="flex items-center gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={startDictation} disabled={isDictating}>
                  {isDictating ? 'Listening…' : 'Voice log'}
                </Button>
                <p className="text-xs text-gray-500">Speak to fill this message; multilingual transcripts supported.</p>
              </div>
              {detectedLang && <p className="text-xs text-gray-500 mt-1">Detected language: {detectedLang}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={sending}>Send Message</Button>
            </div>
          </form>
        </Card>

        <Card className="mt-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">
            <strong>⚠️ Not for emergencies:</strong> For medical emergencies, call <a href="tel:911" className="font-bold underline">911</a>. 
            For urgent matters, call our office at <a href="tel:+16715550123" className="font-bold underline">(671) 555-0123</a>.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
