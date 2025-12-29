/**
 * Record Screen with State Machine & Gating
 * Enforces: No audio → No note
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { createEncounterStateMachine } from '@/lib/state-machines/reducers';
import { createCaptureSessionStateMachine } from '@/lib/state-machines/reducers';
import { canCreateNote } from '@/lib/notes/note-gating';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';
import { supabase } from '@/lib/supabase/client';

export default function RecordPage() {
  const params = useParams();
  const encounterId = typeof params['id'] === 'string' ? params['id'] : '';
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [encounterState, setEncounterState] = useState(createEncounterStateMachine('IN_PROGRESS'));
  const [captureState] = useState(createCaptureSessionStateMachine('IDLE'));
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load encounter
  useEffect(() => {
    if (!isAuthenticated || !encounterId) return;

    const loadEncounter = async () => {
      const { data, error } = await supabase
        .from('encounters')
        .select('*')
        .eq('id', encounterId)
        .single();

      if (error) {
        setError(`Failed to load encounter: ${error.message}`);
        return;
      }

      // Set encounter state based on database state
      const stateMachine = createEncounterStateMachine(data.status || 'IN_PROGRESS');
      setEncounterState(stateMachine);
    };

    loadEncounter();
  }, [isAuthenticated, encounterId]);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    
    // State machine: Stop recording → Transcribing
    try {
      encounterState.transition('STOP_RECORDING', { streamActive: true });
      encounterState.transition('TRANSCRIBE_COMPLETE', { hasAudio: true });
      setEncounterState(encounterState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
    }
  };

  const handleCreateNote = () => {
    // Gating: Check if note can be created
    const gating = canCreateNote({
      hasAudio: !!audioBlob,
      audioValidated: true,
      captureSessionId: null,
      transcriptId: null,
    });

    if (!gating.allowed) {
      setError(gating.reason || 'Unable to create note');
      return;
    }

    try {
      encounterState.transition('CREATE_NOTE', { hasAudio: true });
      setEncounterState(encounterState);
      router.push(`/provider/encounters/${encounterId}/note`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const gating = canCreateNote({
    hasAudio: !!audioBlob,
    audioValidated: true,
    captureSessionId: null,
    transcriptId: null,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        {/* Hard-stop Error Banner */}
        {error && (
          <Card variant="elevated" className="bg-red-50 border-2 border-red-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Gating Banner */}
        {!gating.allowed && (
          <Card variant="elevated" className="bg-yellow-50 border-2 border-yellow-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                <p className="mt-1 text-sm text-yellow-700">{gating.reason}</p>
              </div>
            </div>
          </Card>
        )}

        <Card variant="elevated" className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Encounter</h2>

          {/* State Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Encounter State:</span>
              <span className="text-sm font-semibold text-primary-600">{encounterState.state}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Capture State:</span>
              <span className="text-sm font-semibold text-primary-600">{captureState.state}</span>
            </div>
          </div>

          {/* Voice Recorder */}
          {!audioBlob ? (
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={() => router.back()}
              maxDuration={600}
            />
          ) : (
            <div className="space-y-4">
              <Card variant="elevated" className="p-4 bg-green-50 border-2 border-green-500">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    Audio recorded successfully ({(audioBlob.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </Card>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCreateNote}
                disabled={!gating.allowed}
                className="w-full"
              >
                Create Note from Recording
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

