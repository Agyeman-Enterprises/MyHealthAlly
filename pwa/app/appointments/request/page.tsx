'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { translateText } from '@/lib/utils/translate';
import { VoiceConsole } from '@/components/voice/VoiceConsole';

const apptTypes = [
  { value: 'new_patient', label: 'New Patient Visit' },
  { value: 'follow_up', label: 'Follow-up Visit' },
  { value: 'annual', label: 'Annual Physical' },
  { value: 'sick', label: 'Sick Visit' },
  { value: 'telehealth', label: 'Telehealth Consultation' },
  { value: 'lab_review', label: 'Lab Results Review' },
  { value: 'medication', label: 'Medication Management' },
];

export default function RequestAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isDictating, setIsDictating] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');
  const [showVoice, setShowVoice] = useState(true);
  
  // Get date and time from query params (passed from calendar)
  const dateFromQuery = searchParams.get('date') || '';
  const timeFromQuery = searchParams.get('time') || '';
  
  const [form, setForm] = useState({ 
    type: '', 
    reason: '', 
    urgency: 'routine', 
    date: dateFromQuery, 
    time: timeFromQuery, 
    telehealth: false 
  });
  const [submitting, setSubmitting] = useState(false);

  const parseDateTimeFromTranscript = (t: string) => {
    const lower = t.toLowerCase();
    // Date: ISO-like or month/day
    const isoMatch = lower.match(/\b(\d{4}-\d{1,2}-\d{1,2})\b/);
    const mdMatch = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})([\/\-](\d{2,4}))?\b/);
    let parsedDate = '';
    if (isoMatch?.[1]) {
      parsedDate = isoMatch[1];
    } else if (mdMatch?.[1] && mdMatch?.[2]) {
      const m = mdMatch[1].padStart(2, '0');
      const d = mdMatch[2].padStart(2, '0');
      const y = mdMatch[4] ? (mdMatch[4].length === 2 ? `20${mdMatch[4]}` : mdMatch[4]) : new Date().getFullYear().toString();
      parsedDate = `${y}-${m}-${d}`;
    }

    // Time: HH:MM or HH AM/PM
    const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
    let parsedTime = '';
    if (timeMatch?.[1]) {
      let hh = parseInt(timeMatch[1] ?? '0', 10);
      const mm = timeMatch[2] || '00';
      const suffix = timeMatch[3];
      if (suffix === 'pm' && hh < 12) hh += 12;
      if (suffix === 'am' && hh === 12) hh = 0;
      parsedTime = `${hh.toString().padStart(2, '0')}:${mm}`;
    }

    return { parsedDate, parsedTime };
  };

  // Update form when query params change (if user navigates with different params)
  useEffect(() => {
    if (dateFromQuery) {
      setForm(prev => ({ ...prev, date: dateFromQuery }));
    }
    if (timeFromQuery) {
      setForm(prev => ({ ...prev, time: timeFromQuery }));
    }
  }, [dateFromQuery, timeFromQuery]);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) { alert('Please select an appointment type'); return; }
    setSubmitting(true);
    try {
      const { detectedLang: lang } = await translateText(form.reason, 'en');
      setDetectedLang(lang);
      await new Promise(r => setTimeout(r, 800));
      alert(`Appointment request submitted! (lang: ${lang}) We will contact you to confirm.`);
      router.push('/appointments');
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
        const { parsedDate, parsedTime } = parseDateTimeFromTranscript(finalTranscript);
        setForm((prev) => {
          const reason = prev.reason ? `${prev.reason} ${finalTranscript}`.trim() : finalTranscript;
          return {
            ...prev,
            reason,
            date: parsedDate || prev.date,
            time: parsedTime || prev.time,
          };
        });
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
        <DisclaimerBanner />
        {showVoice && (
          <div className="mb-4">
            <VoiceConsole
              title="Voice appointment request (Vietnamese → English)"
              onComplete={({ translated, detectedLang: lang }) => {
                const { parsedDate, parsedTime } = parseDateTimeFromTranscript(translated);
                setDetectedLang(lang);
                setForm((prev) => ({
                  ...prev,
                  reason: prev.reason ? `${prev.reason} ${translated}`.trim() : translated,
                  date: parsedDate || prev.date,
                  time: parsedTime || prev.time,
                }));
                setShowVoice(false);
              }}
              onCancel={() => setShowVoice(false)}
            />
          </div>
        )}

        <Card>
          <h1 className="text-xl font-bold text-navy-600 mb-4">Request Appointment</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400" required>
                <option value="">Select appointment type</option>
                {apptTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Briefly describe why you need this appointment..." className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-primary-400" />
              <div className="flex items-center gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={startDictation} disabled={isDictating}>
                  {isDictating ? 'Listening…' : 'Voice log'}
                </Button>
                <p className="text-xs text-gray-500">Speak in any language; we’ll transcribe and translate.</p>
                <span className="text-xs text-gray-500">Detected: {detectedLang || 'en'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
              <div className="space-y-2">
                {[{ v: 'routine', l: 'Routine', d: 'Within 2-4 weeks' }, { v: 'soon', l: 'Soon', d: 'Within 1 week' }, { v: 'urgent', l: 'Urgent', d: 'Within 24-48 hours' }].map((opt) => (
                  <label key={opt.v} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.urgency === opt.v ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.urgency === opt.v ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                      {form.urgency === opt.v && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input type="radio" name="urgency" value={opt.v} checked={form.urgency === opt.v} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="sr-only" />
                    <div><span className="font-medium text-navy-600">{opt.l}</span><span className="text-sm text-gray-500 ml-2">({opt.d})</span></div>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.telehealth ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                {form.telehealth && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" checked={form.telehealth} onChange={(e) => setForm({ ...form, telehealth: e.target.checked })} className="sr-only" />
              <span className="text-gray-700">I prefer a telehealth appointment</span>
            </label>
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
