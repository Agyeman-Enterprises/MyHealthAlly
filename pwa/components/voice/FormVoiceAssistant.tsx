/**
 * Form Voice Assistant
 * 
 * Best Practice Implementation:
 * - Single centralized voice button (not field-by-field)
 * - Natural Language Processing to understand user intent
 * - Context-aware field mapping
 * - Supports natural commands like "My name is John Doe", "My email is...", etc.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { parseDateFromVoice } from '@/lib/utils/voice-date-parser';

interface FormField {
  id: string;
  label: string;
  type?: string;
  name?: string;
  setValue: (value: string) => void;
}

interface FormVoiceAssistantProps {
  fields: FormField[];
  onFieldFilled?: (fieldId: string, value: string) => void;
  disabled?: boolean;
  className?: string;
}

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

export function FormVoiceAssistant({
  fields,
  onFieldFilled,
  disabled = false,
  className = '',
}: FormVoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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

  /**
   * Parse natural language and identify which field to fill
   */
  const parseNaturalLanguage = (text: string): { fieldId: string | null; value: string } | null => {
    const lower = text.toLowerCase().trim();

    // Pattern 1: Explicit field mentions with "is" or "="
    // "My name is John Doe", "Email is test@example.com", "Date of birth is January 1st 1990"
    const explicitPatterns = [
      { pattern: /\b(?:my\s+)?(?:first\s+)?name\s+is\s+(.+)/i, fieldKeywords: ['first name', 'firstname', 'name'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
      { pattern: /\b(?:my\s+)?(?:last\s+)?name\s+is\s+(.+)/i, fieldKeywords: ['last name', 'lastname', 'surname'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
      { pattern: /\b(?:my\s+)?email\s+(?:is|address)\s+(.+)/i, fieldKeywords: ['email', 'e-mail'], extractValue: (match: RegExpMatchArray) => {
        const emailMatch = match[1]?.match(/\b[\w\.-]+@[\w\.-]+\.\w+\b/i);
        return emailMatch ? emailMatch[0] : (match[1]?.trim() || '');
      }},
      { pattern: /\b(?:my\s+)?(?:date\s+of\s+birth|dob|birth\s+date)\s+is\s+(.+)/i, fieldKeywords: ['date of birth', 'dob', 'birth date'], extractValue: (match: RegExpMatchArray) => {
        const dateValue = parseDateFromVoice(match[1] || '');
        return dateValue || (match[1]?.trim() || '');
      }},
      { pattern: /\b(?:my\s+)?phone\s+(?:is|number)\s+(.+)/i, fieldKeywords: ['phone', 'telephone', 'phone number'], extractValue: (match: RegExpMatchArray) => {
        const phoneDigits = match[1]?.replace(/\D/g, '') || '';
        if (phoneDigits.length === 10) {
          return `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
        }
        return match[1]?.trim() || '';
      }},
      { pattern: /\b(?:my\s+)?address\s+is\s+(.+)/i, fieldKeywords: ['address', 'street address'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
      { pattern: /\b(?:my\s+)?city\s+is\s+(.+)/i, fieldKeywords: ['city'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
      { pattern: /\b(?:my\s+)?state\s+is\s+(.+)/i, fieldKeywords: ['state'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
      { pattern: /\b(?:my\s+)?zip\s+(?:code\s+)?is\s+(.+)/i, fieldKeywords: ['zip', 'zip code', 'postal code'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
      { pattern: /\b(?:my\s+)?gender\s+is\s+(.+)/i, fieldKeywords: ['gender', 'sex'], extractValue: (match: RegExpMatchArray) => match[1]?.trim() || '' },
    ];

    for (const { pattern, fieldKeywords, extractValue } of explicitPatterns) {
      const match = lower.match(pattern);
      if (match) {
        const value = extractValue(match);
        if (!value) continue; // Skip if no value extracted
        // Find matching field
        for (const field of fields) {
          const fieldLabelLower = field.label.toLowerCase();
          if (fieldKeywords.some(keyword => fieldLabelLower.includes(keyword))) {
            return { fieldId: field.id, value };
          }
        }
      }
    }

    // Pattern 2: Direct value extraction when field is focused/active
    if (activeField) {
      const field = fields.find(f => f.id === activeField);
      if (field) {
        let value = text;
        
        // Apply type-specific parsing
        if (field.type === 'date') {
          value = parseDateFromVoice(text) || text;
        } else if (field.type === 'tel') {
          const phoneDigits = text.replace(/\D/g, '');
          if (phoneDigits.length === 10) {
            value = `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
          }
        } else if (field.type === 'email') {
          const emailMatch = text.match(/\b[\w\.-]+@[\w\.-]+\.\w+\b/i);
          value = emailMatch ? emailMatch[0] : text;
        } else if (field.type === 'number') {
          value = text.replace(/\D/g, '');
        }
        
        return { fieldId: activeField, value };
      }
    }

    // Pattern 3: Try to match field by label keywords in the transcript
    for (const field of fields) {
      const fieldLabelLower = field.label.toLowerCase();
      const labelWords = fieldLabelLower.split(/\s+/).filter(w => w.length > 2);
      
      // Check if transcript contains field label words
      const containsLabel = labelWords.some(word => lower.includes(word));
      
      if (containsLabel) {
        // Extract value after field mention
        const fieldMentionPattern = new RegExp(`\\b${fieldLabelLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?:is\\s+)?(.+)`, 'i');
        const fieldMatch = lower.match(fieldMentionPattern);
        
        if (fieldMatch && fieldMatch[1] && typeof fieldMatch[1] === 'string') {
          let value = fieldMatch[1].trim();
          
          // Apply type-specific parsing
          if (field.type === 'date') {
            value = parseDateFromVoice(value) || value;
          } else if (field.type === 'tel') {
            const phoneDigits = value.replace(/\D/g, '');
            if (phoneDigits.length === 10) {
              value = `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
            }
          } else if (field.type === 'email') {
            const emailMatch = value.match(/\b[\w\.-]+@[\w\.-]+\.\w+\b/i);
            value = emailMatch ? emailMatch[0] : value;
          }
          
          return { fieldId: field.id, value };
        }
      }
    }

    return null;
  };

  const startSpeechRecognition = () => {
    const speechWindow = window as WindowWithSpeechRecognition;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorWithTimeout('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening for natural conversation
    recognition.interimResults = true;
    recognition.lang = userLanguage;

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
          
          // Process final transcript
          const parsed = parseNaturalLanguage(finalTranscript.trim());
          if (parsed && parsed.fieldId) {
            const field = fields.find(f => f.id === parsed.fieldId);
            if (field) {
              field.setValue(parsed.value);
              setActiveField(parsed.fieldId);
              onFieldFilled?.(parsed.fieldId, parsed.value);
              
              // Clear transcript after processing
              finalTranscriptRef.current = '';
              finalTranscript = '';
            }
          }
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();
      setLiveTranscript(fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorWithTimeout('Microphone access denied. You can still type normally.');
        } else {
          setErrorWithTimeout(`Speech error: ${event.error}`);
        }
      }
    };

    recognition.onend = () => {
      // Continue listening if still recording
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
      setActiveField(null);

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
    setLiveTranscript('');
    setActiveField(null);
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-12 h-12
          rounded-full
          flex items-center justify-center
          transition-all duration-200
          touch-target
          ${isRecording 
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        `}
        aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
        title={isRecording ? 'Stop voice input' : 'Start voice input - Say things like "My name is John Doe" or "My email is test@example.com"'}
      >
        {isRecording ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        )}
      </button>

      {isRecording && liveTranscript && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg max-w-sm z-50 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Listening...</span>
          </div>
          <div className="text-gray-300 italic border-t border-gray-700 pt-2 mt-2">
            {liveTranscript}
          </div>
          {activeField && (
            <div className="text-xs text-green-400 mt-2 border-t border-gray-700 pt-2">
              ✓ Filled: {fields.find(f => f.id === activeField)?.label}
            </div>
          )}
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
