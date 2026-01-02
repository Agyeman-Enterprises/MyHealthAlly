'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceInput({ onTranscript, disabled = false, className = '', size = 'md' }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  const userLanguage = user?.preferredLanguage || 'en-US';

  useEffect(() => {
    return () => {
      stopRecording();
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);
  };

  const setErrorWithTimeout = (message: string) => {
    setError(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorWithTimeout('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = userLanguage;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        
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

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorWithTimeout('Microphone access denied. You can still type normally.');
        } else {
          setErrorWithTimeout(`Speech error: ${event.error}`);
        }
      }
    };

    recognition.onend = () => {
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
      console.error('Speech recognition start error:', e);
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
      clearError();
      setLiveTranscript('');
      finalTranscriptRef.current = '';

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setIsRecording(true);
      startSpeechRecognition();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      if (errorMessage.includes('denied') || errorMessage.includes('blocked') || errorMessage.includes('permission')) {
        setErrorWithTimeout('Microphone access denied. You can still type normally.');
      } else {
        setErrorWithTimeout(errorMessage);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    stopSpeechRecognition();
    setIsRecording(false);
    
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

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          transition-all duration-200
          touch-target
          ${isRecording 
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-primary-100 text-primary-600 hover:bg-primary-200 active:bg-primary-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        `}
        aria-label={isRecording ? 'Stop recording' : 'Record'}
        title={isRecording ? 'Stop recording' : 'Record voice input'}
      >
        {isRecording ? (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        ) : (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        )}
      </button>

      {isRecording && liveTranscript && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg max-w-xs z-50 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording...</span>
          </div>
          <div className="text-gray-300 italic border-t border-gray-700 pt-2 mt-2">
            {liveTranscript}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg max-w-xs z-50 shadow-xl">
          <div className="flex items-start gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

