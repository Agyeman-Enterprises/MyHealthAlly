'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  language?: string;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({
  onTranscript,
  onRecordingChange,
  language,
  disabled = false,
  className = '',
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item: (index: number) => SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    length: number;
    item: (index: number) => SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  interface WindowWithSpeechRecognition extends Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const { user } = useAuthStore();

  // Get user's preferred language
  const userLanguage = language || user?.preferredLanguage || 'en-US';

  useEffect(() => {
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSpeechRecognition = () => {
    const speechWindow = window as WindowWithSpeechRecognition;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = userLanguage;

    recognition.onstart = () => {
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results.item(i);
        if (!result) continue;
        const firstAlternative = result.item(0);
        const transcript = firstAlternative?.transcript || '';
        
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();
      setLiveTranscript(fullTranscript);
      onTranscript(fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (isRecording && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started or stopped
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Could not start speech recognition:', e);
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

      if (navigator.permissions) {
        const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionResult.state === 'denied') {
          throw new Error('Microphone permission denied. Please enable in browser settings.');
        }
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsRecording(true);
      onRecordingChange?.(true);

      startSpeechRecognition();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      onRecordingChange?.(false);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    stopSpeechRecognition();
    setIsRecording(false);
    onRecordingChange?.(false);
    
    if (finalTranscriptRef.current.trim()) {
      onTranscript(finalTranscriptRef.current.trim());
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          transition-all duration-200
          touch-target
          ${isRecording 
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        title={isRecording ? 'Stop recording' : 'Record voice input'}
      >
        {isRecording ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        )}
      </button>

      {isRecording && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording...
          </div>
          {liveTranscript && (
            <div className="mt-2 pt-2 border-t border-gray-700 max-w-xs">
              <div className="text-gray-300 italic">{liveTranscript}</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}

