'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { transcribeAudio } from '@/lib/services/transcription';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function VoiceMessagePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const uploadAndSendMutation = useMutation({
    mutationFn: async ({ audioBlob, transcript }: { audioBlob: Blob; transcript: string }) => {
      // Upload audio to Supabase Storage
      const fileName = `voice-messages/${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-uploads')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('patient-uploads')
        .getPublicUrl(fileName);

      // Create message thread and send message with voice attachment
      // This would integrate with your message API
      // For now, we'll store in Supabase messages table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get patient ID from user
      const { data: userRecord } = await supabase
        .from('users')
        .select('id, patients(id)')
        .eq('supabase_auth_id', user.id)
        .single();

      if (!userRecord || !userRecord.patients) {
        throw new Error('Patient record not found');
      }

      const patientId = (userRecord.patients as any).id;

      // Create or get message thread
      const { data: thread, error: threadError } = await supabase
        .from('message_threads')
        .select('id')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let threadId: string;
      if (thread) {
        threadId = thread.id;
      } else {
        // Create new thread
        const { data: newThread, error: createError } = await supabase
          .from('message_threads')
          .insert({
            patient_id: patientId,
            subject: 'Voice Message',
            status: 'open',
            priority: 'normal',
          })
          .select('id')
          .single();

        if (createError) throw createError;
        threadId = newThread.id;
      }

      // Insert message with voice attachment
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_user_id: userRecord.id,
          sender_role: 'patient',
          type: 'voice',
          content: transcript,
          voice_url: urlData.publicUrl,
          voice_transcript: transcript,
          voice_transcript_language: detectedLanguage || 'en',
        })
        .select('id')
        .single();

      if (messageError) throw messageError;

      return { threadId, messageId: message.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      router.push(`/messages/${data.threadId}`);
    },
  });

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      // Get detected language from store (if available)
      const { getDetectedLanguage } = await import('@/lib/i18n/language-store');
      const detectedLang = getDetectedLanguage();
      const result = await transcribeAudio(blob, detectedLang || undefined);
      setTranscript(result.text);
      
      // Store detected language if transcription returned one
      if (result.language) {
        setDetectedLanguage(result.language);
        const { setDetectedLanguage: setStoreLanguage } = await import('@/lib/i18n/language-store');
        setStoreLanguage(result.language);
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      setTranscriptionError(error.message || 'Failed to transcribe audio');
      // Allow user to proceed with manual entry
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = () => {
    if (!audioBlob) return;
    if (!transcript.trim() && !transcriptionError) {
      alert('Please wait for transcription to complete or enter text manually');
      return;
    }

    // Get language information
    const { getDetectedLanguage, getLanguageForAPI } = await import('@/lib/i18n/language-store');
    const detectedLang = getDetectedLanguage();
    
    uploadAndSendMutation.mutate({
      audioBlob,
      transcript: transcript || 'Voice message (transcription unavailable)',
      detectedLanguage: detectedLanguage || detectedLang || undefined,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Record Voice Message" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        {!audioBlob ? (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => router.back()}
            maxDuration={300}
          />
        ) : (
          <div className="space-y-6">
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Recording</h3>
              
              {isTranscribing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Transcribing audio...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transcription
                    </label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Transcription will appear here..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                      rows={6}
                    />
                    {transcriptionError && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ {transcriptionError}. You can edit the text above.
                      </p>
                    )}
                  </div>

                  <audio controls className="w-full mb-4">
                    <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAudioBlob(null);
                        setTranscript('');
                        setTranscriptionError(null);
                      }}
                    >
                      Record Again
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSend}
                      isLoading={uploadAndSendMutation.isPending}
                      disabled={!transcript.trim()}
                    >
                      Send Message
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

