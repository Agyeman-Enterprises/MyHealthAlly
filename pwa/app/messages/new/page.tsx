'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { RequirePractice } from '@/components/RequirePractice';
import { translateText } from '@/lib/utils/translate';
import { sendMessageToSolopractice, handleMessageStatus } from '@/lib/api/message-helpers';
import { SoloPracticeApiError } from '@/lib/api/solopractice-client';
import { getPrimaryClinician } from '@/lib/supabase/queries';

const baseRecipients = [
  { id: 'care-team', name: 'Care Team', desc: 'General questions and concerns' },
  { id: 'nurse', name: 'Nursing Staff', desc: 'Clinical questions' },
  { id: 'billing', name: 'Billing Department', desc: 'Payment and insurance' },
  { id: 'scheduling', name: 'Scheduling', desc: 'Appointments' },
];

export default function NewMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { patientId } = useAuthStore();
  const [form, setForm] = useState({ recipient: '', subject: '', message: '' });
  const [detectedLang, setDetectedLang] = useState<string>('en');
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState(baseRecipients);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

  // Load primary clinician (MD owner) dynamically
  useEffect(() => {
    const loadPrimaryClinician = async () => {
      if (!patientId) {
        setLoadingRecipients(false);
        return;
      }
      
      try {
        const primaryClinician = await getPrimaryClinician(patientId);
        if (primaryClinician) {
          // Add primary MD to recipients list
          setRecipients([
            ...baseRecipients.slice(0, 1), // care-team
            { 
              id: `md-${primaryClinician.id}`, 
              name: primaryClinician.displayName, 
              desc: 'Your primary care physician' 
            },
            ...baseRecipients.slice(1), // nurse, billing, scheduling
          ]);
        }
      } catch (error) {
        console.error('Error loading primary clinician:', error);
      } finally {
        setLoadingRecipients(false);
      }
    };
    
    loadPrimaryClinician();
  }, [patientId]);

  // Pre-fill form from query parameters
  useEffect(() => {
    const recipient = searchParams.get('recipient') || '';
    const subject = searchParams.get('subject') || '';
    const context = searchParams.get('context') || '';
    
    if (recipient || subject || context) {
      setForm({
        recipient: recipient,
        subject: subject || (context ? `Question about ${context}` : ''),
        message: context ? `I have a question about ${context}.` : '',
      });
    }
  }, [searchParams]);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  function NewMessagePageInner() {
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient || !form.subject || !form.message) {
      alert('Please fill in all fields');
      return;
    }
    setSending(true);
    try {
      // Translate message to English before sending to Solopractice
      // Even if patient types/spoke in foreign language, Solopractice receives it in English
      const { translatedText: englishMessage, detectedLang: lang } = await translateText(form.message, 'en');
      setDetectedLang(lang);
      
      // Translate subject to English as well if needed
      const { translatedText: englishSubject } = await translateText(form.subject, 'en');
      
      // Send message to Solopractice in English with recipient information for routing
      const response = await sendMessageToSolopractice(
        englishMessage, // Send translated English version
        englishSubject, // Send translated English subject
        undefined, // threadId - will be created or retrieved
        lang, // Keep detected language for reference
        form.recipient // Pass recipient so Solopractice can route to correct mailbox/person
      );
      
      // Handle response status
      const status = handleMessageStatus(response);
      
      if (status.success) {
        if (status.action === 'show_deferred') {
          alert(`Message received! ${status.message}`);
        } else {
          alert(status.message);
        }
        router.push('/messages');
      } else {
        if (status.action === 'redirect_emergency') {
          const proceed = confirm(`${status.message}\n\nWould you like to call 911?`);
          if (proceed) {
            window.location.href = 'tel:911';
          }
        } else {
          alert(status.message);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof SoloPracticeApiError) {
        if (error.code === 401) {
          alert('Your session has expired. Please log in again.');
          router.push('/auth/login');
        } else if (error.code === 403) {
          alert('Message was blocked. Please call the office for urgent matters.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Failed to send message. Please try again or call the office.');
      }
    } finally {
      setSending(false);
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
              {loadingRecipients ? (
                <select disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                  <option>Loading recipients...</option>
                </select>
              ) : (
                <select value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" required>
                  <option value="">Select recipient</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} - {r.desc}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your question" className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400" required />
              <div className="absolute right-2 top-[2.5rem]">
                <VoiceInput onTranscript={(text) => setForm({ ...form, subject: form.subject ? `${form.subject} ${text}` : text })} size="sm" />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} placeholder="Type your message here..." className="w-full px-4 py-3 pr-12 pb-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" required />
              <div className="absolute right-2 bottom-2">
                <VoiceInput onTranscript={(text) => setForm({ ...form, message: form.message ? `${form.message} ${text}` : text })} size="sm" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Tap the microphone icon to record voice input. Real-time transcription in your language.</p>
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

  return (
    <RequirePractice featureName="Messages">
      <NewMessagePageInner />
    </RequirePractice>
  );
}
