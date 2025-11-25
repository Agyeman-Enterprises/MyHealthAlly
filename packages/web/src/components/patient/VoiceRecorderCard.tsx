'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecordButton } from './RecordButton';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { processVoiceMessage } from '@/services/patient/voice-actions';

type RecorderStatus = 'idle' | 'recording' | 'processing' | 'success' | 'error';

const AUTO_STOP_MS = 60 * 1000; // 60 seconds

export function VoiceRecorderCard() {
  const { startListening, stopListening, isListening, transcript, error: captureError } = useVoiceCapture();
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [processingStart, setProcessingStart] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRecording = status === 'recording' || isListening;
  const isProcessing = status === 'processing';

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleStopRecording = useCallback(
    async (reason: 'user' | 'timeout' = 'user') => {
      if (!isRecording && !isListening) {
        return;
      }
      resetTimer();
      setStatus('processing');
      setProcessingStart(new Date());

      try {
        const result = await stopListening();
        const cleanedTranscript = result?.transcript?.trim();

        if (!cleanedTranscript) {
          setStatus('error');
          setStatusMessage(
            reason === 'timeout'
              ? 'We could not capture any speech. Please try recording again.'
              : 'No speech detected. Please try again.',
          );
          return;
        }

        setLastTranscript(cleanedTranscript);
        const actionResult = await processVoiceMessage(cleanedTranscript, result?.audioBlob);

        if (actionResult.success) {
          setStatus('success');
          setAiResponse(actionResult.message);
          setStatusMessage('Your message has been received. The care team is reviewing it now.');
        } else {
          setStatus('error');
          setStatusMessage(actionResult.message || 'We were unable to process your message. Please try again.');
        }
      } catch (err: any) {
        console.error('Failed to process voice recording', err);
        setStatus('error');
        setStatusMessage('We ran into an issue sending your recording. Please try again.');
      }
    },
    [isListening, isRecording, stopListening],
  );

  const handleStartRecording = useCallback(async () => {
    if (isRecording || isProcessing) {
      return;
    }

    setStatus('recording');
    setStatusMessage('Listening… tap to stop when you are done.');
    setAiResponse('');
    setLastTranscript('');

    try {
      await startListening();
      timeoutRef.current = setTimeout(() => handleStopRecording('timeout'), AUTO_STOP_MS);
    } catch (err: any) {
      console.error('Unable to start recording', err);
      setStatus('error');
      setStatusMessage(err?.message || 'Microphone access was denied. Please allow microphone permission.');
    }
  }, [handleStopRecording, isProcessing, isRecording, startListening]);

  useEffect(() => {
    if (captureError) {
      setStatus('error');
      setStatusMessage(captureError);
      resetTimer();
    }
  }, [captureError]);

  useEffect(() => {
    return () => resetTimer();
  }, []);

  const processingDuration = useMemo(() => {
    if (!processingStart || status !== 'processing') return null;
    const diff = Date.now() - processingStart.getTime();
    return Math.round(diff / 1000);
  }, [processingStart, status]);

  return (
    <Card className="bg-white border border-myh-borderSoft shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Need to share something quickly?</CardTitle>
        <p className="text-sm text-myh-textSoft">
          Record a voice message for your care team. We will transcribe it, translate if needed, and route it for review.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center gap-6">
          <RecordButton
            isRecording={isRecording}
            disabled={isProcessing}
            onRecordStart={handleStartRecording}
            onRecordStop={() => handleStopRecording('user')}
          />

          {/* Status */}
          <div className="min-h-[48px] text-center">
            {status === 'recording' && (
              <div className="flex flex-col items-center gap-2 text-sm text-myh-textSoft">
                <WaveformVisualizer />
                <p>{statusMessage}</p>
              </div>
            )}
            {status === 'processing' && (
              <div className="flex flex-col items-center gap-2 text-sm text-myh-textSoft">
                <Loader2 className="w-5 h-5 animate-spin text-myh-primary" />
                <p>{processingDuration ? `Processing (${processingDuration}s)…` : 'Processing your message…'}</p>
              </div>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-myh-success">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-myh-danger">
                <AlertTriangle className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}
            {status === 'idle' && (
              <p className="text-sm text-myh-textSoft">Tap the red button and speak naturally for up to one minute.</p>
            )}
          </div>

          {/* Transcript preview */}
          {(lastTranscript || transcript) && (
            <div className="w-full rounded-xl border border-myh-borderSoft bg-myh-background p-4">
              <p className="text-xs uppercase tracking-wide text-myh-textSoft mb-1">Transcript preview</p>
              <p className="text-sm text-myh-textPrimary leading-relaxed">{lastTranscript || transcript}</p>
              <p className="text-2xs text-myh-textSoft mt-2">A complete copy is saved to your chart automatically.</p>
            </div>
          )}

          {/* AI response */}
          {aiResponse && (
            <div className="w-full rounded-xl border border-myh-borderSoft bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-myh-textSoft mb-1">Assistant update</p>
              <p className="text-sm text-myh-textPrimary leading-relaxed">{aiResponse}</p>
              <p className="text-2xs text-myh-textSoft mt-2">Status: Care team reviewing</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WaveformVisualizer() {
  const bars = Array.from({ length: 20 });
  return (
    <div className="flex items-end gap-1 h-6">
      {bars.map((_, index) => (
        <span
          key={`bar-${index}`}
          className="w-1 rounded-full bg-red-500/80 animate-pulse"
          style={{
            height: `${30 + ((index * 7) % 50)}%`,
            animationDuration: `${0.9 + (index % 5) * 0.1}s`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

