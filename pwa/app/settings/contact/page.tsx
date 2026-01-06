'use client';
import { useState } from 'react';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { translateText } from '@/lib/utils/translate';

export default function ContactPage() {
  const { isLoading } = useRequireAuth();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (isLoading) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    
    try {
      const { detectedLang: lang } = await translateText(form.message, 'en');
      setDetectedLang(lang);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      setSuccess(data.message || 'Message sent! We will respond within 1-2 business days.');
      setForm({ subject: '', message: '' });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(message);
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
      recognition.onerror = () => {
        setIsDictating(false);
      };
      recognition.onend = () => {
        setIsDictating(false);
        const finalTranscript = sessionTranscript.trim();
        if (!finalTranscript) return;
        setForm((prev) => ({ ...prev, message: prev.message ? `${prev.message} ${finalTranscript}`.trim() : finalTranscript }));
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
        <h1 className="text-2xl font-bold text-navy-600 mb-1">Contact Us</h1>
        <p className="text-gray-600 mb-6">Get in touch with our support team</p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">{success}</div>}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="font-semibold text-navy-600">Phone</h3>
            <a href="tel:+16715550123" className="text-primary-600 hover:underline">(671) 555-0123</a>
            <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9AM-5PM ChST</p>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2">🚨</div>
            <h3 className="font-semibold text-navy-600">Emergency</h3>
            <a href="tel:911" className="text-red-600 font-bold hover:underline">Call 911</a>
            <p className="text-xs text-gray-500 mt-1">For medical emergencies</p>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-navy-600 mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" required>
                <option value="">Select a topic</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="account">Account Help</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" required />
              <div className="flex items-center gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={startDictation} disabled={isDictating}>
                  {isDictating ? 'Listening…' : 'Voice log'}
                </Button>
                <p className="text-xs text-gray-500">Speak in your language; we’ll translate.</p>
                <span className="text-xs text-gray-500">Detected: {detectedLang || 'en'}</span>
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full" isLoading={sending}>Send Message</Button>
          </form>
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold text-navy-600 mb-2">📍 Office Location</h3>
          <p className="text-gray-600">Ohimaa GU Functional Medicine</p>
          <p className="text-gray-600">123 Health Center Drive</p>
          <p className="text-gray-600">Tamuning, GU 96913</p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
