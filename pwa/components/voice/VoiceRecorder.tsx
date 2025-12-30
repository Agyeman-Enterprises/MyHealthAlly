'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MicDiagnostics } from './MicDiagnostics';
import { createCaptureSessionStateMachine } from '@/lib/state-machines/reducers';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, transcript: string) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDuration = 300, // 5 minutes default
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: (() => void) | null;
    onresult: ((event: { resultIndex: number; results: Array<{ [key: number]: Array<{ transcript: string }>; isFinal: boolean }> }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
  }
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const stateMachineRef = useRef(createCaptureSessionStateMachine('IDLE'));

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording();
      stopSpeechRecognition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSpeechRecognition = () => {
    interface SpeechRecognitionConstructor {
      new (): SpeechRecognition;
    }
    const SpeechRecognition = (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognition & {
      onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    };
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsTranscribing(true);
    };

    recognition.onresult = (event: { resultIndex: number; results: Array<{ [key: number]: Array<{ transcript: string }>; isFinal: boolean }> }) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i] as unknown as { isFinal: boolean } & { [key: number]: { transcript: string } };
        const firstAlternative = result?.[0];
        if (!firstAlternative) continue;
        const transcript = firstAlternative.transcript;
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += transcript;
        }
      }

      setLiveTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: { error: string }) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // This is normal, just means silence
      } else if (event.error === 'aborted') {
        // User stopped or we stopped it
      } else {
        setError(`Speech recognition: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsTranscribing(false);
      // Restart if still recording
      if (isRecording && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.log('Could not start speech recognition:', e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setLiveTranscript('');
      finalTranscriptRef.current = '';
      
      // Check permissions first
      if (navigator.permissions) {
        const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionResult.state === 'denied') {
          throw new Error('Microphone permission denied. Please enable in browser settings.');
        }
      }

      // Request stream with explicit device selection if available
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      // State machine: Initialize
      stateMachineRef.current.transition('INITIALIZE');
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setStream(stream);
      
      // State machine: Stream ready
      stateMachineRef.current.transition('STREAM_READY', { streamActive: true });

      // iOS Safari compatibility: Try different mime types
      let mimeType = 'audio/webm;codecs=opus';
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS Safari supports these formats
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
          mimeType = 'audio/mpeg';
        } else {
          // Fallback to default (iOS will use its default)
          mimeType = '';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? {
        mimeType: mimeType,
      } : undefined);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // State machine: Complete
        stateMachineRef.current.transition('COMPLETE');
        
        // Stop speech recognition
        stopSpeechRecognition();
        
        // Use the same mime type for blob, or fallback
        const blobType = mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        
        // Pass the transcript along with the audio
        const finalText = finalTranscriptRef.current.trim() || liveTranscript.trim();
        onRecordingComplete(audioBlob, duration, finalText);
        cleanup();
      };

      // State machine: Start recording (guard: stream must be active)
      if (!stateMachineRef.current.getDiagnostics().streamActive) {
        throw new Error('Cannot start recording: Stream not active');
      }
      
      stateMachineRef.current.transition('START_RECORDING');
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start real-time speech recognition
      startSpeechRecognition();

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // State machine: Stop recording
      stateMachineRef.current.transition('STOP');
      stateMachineRef.current.transition('PROCESS');
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card variant="elevated" className="p-6">
      <div className="text-center space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center">
          {isRecording ? (
            <div className="relative">
              <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </div>
          )}

          <div className="mt-6">
            <p className="text-3xl font-bold text-gray-900">{formatDuration(duration)}</p>
            <p className="text-sm text-gray-500 mt-2">
              {isRecording ? 'Recording...' : 'Ready to record'}
            </p>
            {isTranscribing && (
              <p className="text-xs text-primary-600 mt-1">🎤 Live transcription active</p>
            )}
          </div>
        </div>

        {/* Live Transcript Preview */}
        {(isRecording || liveTranscript) && (
          <div className="bg-gray-50 rounded-xl p-4 text-left max-h-32 overflow-y-auto">
            <p className="text-xs font-medium text-gray-500 mb-1">Live Transcript:</p>
            <p className="text-sm text-gray-700">
              {liveTranscript || <span className="text-gray-400 italic">Speak now...</span>}
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <Button
              variant="primary"
              size="lg"
              onClick={startRecording}
              className="px-8"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
              Start Recording
            </Button>
          ) : (
            <Button
              variant="danger"
              size="lg"
              onClick={stopRecording}
              className="px-8"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop Recording
            </Button>
          )}

          {onCancel && (
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>

        {isRecording && (
          <p className="text-xs text-gray-500">
            Maximum duration: {formatDuration(maxDuration)}
          </p>
        )}

        {/* Mic Diagnostics */}
        <div className="mt-6">
          <MicDiagnostics
            stream={stream}
            isRecording={isRecording}
            error={error}
          />
        </div>
      </div>
    </Card>
  );
}

