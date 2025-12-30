/**
 * Voice Transcription Service
 * Handles audio transcription using OpenAI Whisper API
 */

import { env } from '@/lib/env';

const OPENAI_API_KEY = env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

/**
 * Transcribe audio using OpenAI Whisper
 * Falls back to browser SpeechRecognition API if OpenAI key not available
 */
/**
 * Transcribe audio with language detection
 * MHA sends to SoloPractice for server-side transcription and translation
 */
export async function transcribeAudio(
  audioBlob: Blob,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _detectedLanguage?: string
): Promise<TranscriptionResult> {
  // Try OpenAI Whisper first (if API key available)
  if (OPENAI_API_KEY) {
    try {
      return await transcribeWithOpenAI(audioBlob);
    } catch (error) {
      console.warn('OpenAI transcription failed, falling back to browser API:', error);
    }
  }

  // Fallback to browser SpeechRecognition API
  return await transcribeWithBrowserAPI(audioBlob);
}

/**
 * Transcribe using OpenAI Whisper API
 */
async function transcribeWithOpenAI(audioBlob: Blob): Promise<TranscriptionResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en'); // Can be made dynamic based on user preference

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Transcription failed');
  }

  const data = await response.json();
  return {
    text: data.text,
    language: data.language,
  };
}

/**
 * Transcribe using browser SpeechRecognition API (fallback)
 * Note: This requires user interaction and may not work in all browsers
 */
async function transcribeWithBrowserAPI(audioBlob: Blob): Promise<TranscriptionResult> {
  return new Promise((resolve, reject) => {
    // Check if SpeechRecognition is available
    interface SpeechRecognitionConstructor {
      new (): {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: ((event: { resultIndex: number; results: Array<{ [key: number]: Array<{ transcript: string }>; isFinal: boolean }> }) => void) | null;
        onerror: ((event: { error: string }) => void) | null;
      };
    }
    const SpeechRecognition = (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported in this browser. Please use OpenAI API key for transcription.'));
      return;
    }

    type SpeechRecognizer = InstanceType<typeof SpeechRecognition>;
    const recognition = new SpeechRecognition() as SpeechRecognizer & {
      onend: ((this: SpeechRecognizer, ev: Event) => unknown) | null;
    };
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let transcript = '';

    recognition.onresult = (event: { resultIndex: number; results: Array<{ [key: number]: Array<{ transcript: string }>; isFinal: boolean }> }) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i] as unknown as { [key: number]: { transcript: string } };
        const firstAlternative = result?.[0];
        if (!firstAlternative) continue;
        transcript += firstAlternative.transcript;
      }
    };

    recognition.onerror = (event: { error: string }) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      resolve({
        text: transcript || 'No speech detected',
      });
    };

    // Create audio context and play the blob to trigger recognition
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
    
    recognition.start();

    // Stop after audio finishes (with timeout)
    audio.onended = () => {
      setTimeout(() => {
        recognition.stop();
      }, 1000);
    };
  });
}

/**
 * Get supported languages for transcription
 */
export function getSupportedLanguages(): string[] {
  return [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru',
    // Add more as needed
  ];
}

