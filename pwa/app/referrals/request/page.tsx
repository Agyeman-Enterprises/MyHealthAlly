'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RequirePractice } from '@/components/RequirePractice';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';
import { translateText } from '@/lib/utils/translate';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Orthopedics',
  'Ophthalmology',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Urology',
  'Other',
];

export default function RequestReferralPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    specialty: '',
    reason: '',
    urgency: 'routine' as 'routine' | 'soon' | 'urgent',
    preferredProviderName: '',
    preferredLocation: '',
  });
  const [isDictating, setIsDictating] = useState(false);
  const [detectedLang, setDetectedLang] = useState('en');

  const requestReferralMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients || !Array.isArray(userRecord.patients) || userRecord.patients.length === 0) {
        throw new Error('Patient record not found');
      }

      const patientId = userRecord.patients[0]?.id;
      if (!patientId) {
        throw new Error('Patient ID not found');
      }

      const { data: referral, error } = await supabase
        .from('referral_requests')
        .insert({
          patient_id: patientId,
          specialty: data.specialty,
          reason: data.reason || null,
          urgency: data.urgency,
          preferred_provider_name: data.preferredProviderName || null,
          preferred_location: data.preferredLocation || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return referral;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      router.push('/referrals?success=true');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.specialty.trim()) {
      alert('Please select a specialty');
      return;
    }
    const { detectedLang: lang } = await translateText(formData.reason, 'en');
    setDetectedLang(lang);
    requestReferralMutation.mutate(formData);
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
        setFormData((prev) => ({ ...prev, reason: prev.reason ? `${prev.reason} ${finalTranscript}`.trim() : finalTranscript }));
      };
      recognition.start();
    } catch (err) {
      setIsDictating(false);
      alert(err instanceof Error ? err.message : 'Unable to start voice input.');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  function RequestReferralPageInner() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
        <Header title="Request Referral" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        <Card variant="elevated" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty *
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                required
              >
                <option value="">Select specialty</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Referral
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly describe why you need this referral..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                rows={4}
              />
              <div className="flex items-center gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={startDictation} disabled={isDictating}>
                  {isDictating ? 'Listening…' : 'Voice log'}
                </Button>
                <p className="text-xs text-gray-500">Speak in any language; we’ll transcribe and translate.</p>
                <span className="text-xs text-gray-500">Detected: {detectedLang || 'en'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <div className="space-y-2">
                {(['routine', 'soon', 'urgent'] as const).map((level) => (
                  <label key={level} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'routine' | 'soon' | 'urgent' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <Input
              id="preferredProviderName"
              name="preferredProviderName"
              label="Preferred Provider Name (Optional)"
              type="text"
              placeholder="Dr. Smith"
              value={formData.preferredProviderName}
              onChange={(e) => setFormData({ ...formData, preferredProviderName: e.target.value })}
            />

            <Input
              id="preferredLocation"
              name="preferredLocation"
              label="Preferred Location (Optional)"
              type="text"
              placeholder="City or facility name"
              value={formData.preferredLocation}
              onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={requestReferralMutation.isPending}
                disabled={!formData.specialty.trim()}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <RequirePractice featureName="Referrals">
      <RequestReferralPageInner />
    </RequirePractice>
  );
}

