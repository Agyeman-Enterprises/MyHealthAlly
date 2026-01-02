'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RequirePractice } from '@/components/RequirePractice';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function VoiceMessagePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadAndSendMutation = useMutation({
    mutationFn: async ({ audioBlob, transcript }: { audioBlob: Blob; transcript: string }) => {
      // Get user - try Supabase auth first, then fall back to auth store
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      // Get user from auth store if Supabase auth fails
      const authStore = useAuthStore.getState();
      const storeUser = authStore.user;
      
      if (!supabaseUser && !storeUser?.id) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const authUserId = supabaseUser?.id || storeUser?.id;

      // Get patient ID from user
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', authUserId)
        .single();

      if (userError || !userRecord) {
        // Try with user from auth store as fallback
        if (storeUser?.patientId && storeUser?.id) {
          return await createVoiceMessage(storeUser.id, storeUser.patientId, audioBlob, transcript);
        }
        // Try alternative lookup by email
        const userEmail = supabaseUser?.email || storeUser?.email;
        if (userEmail) {
          const { data: altUser } = await supabase
            .from('users')
            .select('id, patients(id)')
            .eq('email', userEmail)
            .single();
          
          if (altUser?.patients) {
            const patientsArray = Array.isArray(altUser.patients) ? altUser.patients : [altUser.patients];
            const patientId = patientsArray[0]?.id;
            if (!patientId) throw new Error('Patient ID not found');
            return await createVoiceMessage(altUser.id, patientId, audioBlob, transcript);
          }
        }
        throw new Error('Patient record not found. Please complete your intake form.');
      }

      if (!userRecord.patients) {
        throw new Error('Patient record not found. Please complete your intake form.');
      }

      const patientsArray = Array.isArray(userRecord.patients) ? userRecord.patients : [userRecord.patients];
      const patientId = patientsArray[0]?.id;
      if (!patientId) throw new Error('Patient ID not found');
      return await createVoiceMessage(userRecord.id, patientId, audioBlob, transcript);
    },
    onSuccess: (data) => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setTimeout(() => {
        router.push(`/messages/${data.threadId}`);
      }, 1500);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to send message');
    },
  });

  const createVoiceMessage = async (
    userId: string, 
    patientId: string, 
    audioBlob: Blob, 
    transcript: string
  ) => {
    const now = new Date().toISOString();
    
    // Upload audio to Supabase Storage (optional - skip if storage not configured)
    let voiceUrl = null;
    try {
      const fileName = `voice-messages/${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-uploads')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('patient-uploads')
          .getPublicUrl(fileName);
        voiceUrl = urlData.publicUrl;
      }
    } catch {
      console.log('Audio upload skipped (storage not configured)');
    }

    // Create new thread for voice message
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .insert({
        patient_id: patientId,
        subject: 'Voice Message',
        status: 'open',
        priority: 'normal',
        last_message_at: now,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (threadError) throw new Error(threadError.message || 'Failed to create thread');

    // Insert message with voice info
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        thread_id: thread.id,
        sender_user_id: userId,
        sender_role: 'patient',
        type: 'voice',
        content: transcript || 'Voice message',
        voice_url: voiceUrl,
        voice_transcript: transcript,
        created_at: now,
      })
      .select('id')
      .single();

    if (messageError) {
      // Cleanup thread if message fails
      await supabase.from('message_threads').delete().eq('id', thread.id);
      throw new Error(messageError.message || 'Failed to send message');
    }

    return { threadId: thread.id, messageId: message.id };
  };

  const handleRecordingComplete = (blob: Blob, recordDuration: number, liveTranscript: string) => {
    setAudioBlob(blob);
    setDuration(recordDuration);
    setTranscript(liveTranscript || '');
    setError(null);
  };

  const handleSend = () => {
    if (!audioBlob) return;
    if (!transcript.trim()) {
      setError('No transcript detected. Please enter text or record again.');
      return;
    }

    uploadAndSendMutation.mutate({
      audioBlob,
      transcript: transcript.trim(),
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <RequirePractice featureName="Messages">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
        <Header title="Record Voice Message" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">Voice Message Sent!</p>
              <p className="text-sm text-green-600">Redirecting to your conversation...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {!audioBlob ? (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => router.push('/messages')}
            maxDuration={300}
          />
        ) : (
          <div className="space-y-6">
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Recording</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcription
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Enter or edit the transcription..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  rows={6}
                  disabled={success}
                />
                {!transcript && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ No speech was detected. Please type your message above or record again.
                  </p>
                )}
              </div>

              <audio controls className="w-full mb-4">
                <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>

              <p className="text-sm text-gray-500 mb-4">
                Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </p>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAudioBlob(null);
                    setTranscript('');
                    setError(null);
                  }}
                  disabled={success || uploadAndSendMutation.isPending}
                >
                  Record Again
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSend}
                  isLoading={uploadAndSendMutation.isPending}
                  disabled={!transcript.trim() || success}
                >
                  Send Message
                </Button>
              </div>
            </Card>
          </div>
        )}
        </main>

        <BottomNav />
      </div>
    </RequirePractice>
  );
}
