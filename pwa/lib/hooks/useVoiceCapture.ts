import { useCallback, useEffect, useRef, useState } from "react";
import { translateText } from "@/lib/utils/translate";

type CaptureState = "idle" | "listening" | "error";

type VoiceResult = {
  transcript: string;
  translated: string;
  detectedLang: string;
};

type Options = {
  targetLang?: string;
  onPermissionError?: (message: string) => void;
  onError?: (message: string) => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0?: { transcript?: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: Array<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

export function useVoiceCapture(options: Options = {}) {
  const { targetLang = "en", onPermissionError, onError } = options;
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [state, setState] = useState<CaptureState>("idle");
  const [partial, setPartial] = useState("");
  const partialRef = useRef("");
  const [result, setResult] = useState<VoiceResult | null>(null);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognitionCtor =
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionCtor; SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionCtor; SpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      onPermissionError?.("Voice input not supported in this browser.");
      return;
    }

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately - we just needed permission
          stream.getTracks().forEach(track => track.stop());
        } catch (mediaError) {
          const errorMsg = mediaError instanceof Error ? mediaError.message : 'Unknown error';
          if (errorMsg.includes('denied') || errorMsg.includes('blocked') || errorMsg.includes('permission')) {
            setState("error");
            onPermissionError?.("Microphone access was blocked. Please allow mic permissions for this site.");
            return;
          }
          // If it's not a permission error, continue - some browsers don't require getUserMedia for SpeechRecognition
        }
      }

      const recognition = new (SpeechRecognitionCtor as SpeechRecognitionCtor)();
      // Use targetLang if provided, otherwise fall back to navigator language or en-US
      recognition.lang = targetLang || (typeof navigator !== "undefined" && navigator.language) || "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;
      setResult(null);
      setPartial("");
      partialRef.current = "";
      setState("listening");

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let assembled = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const first = res?.[0];
          if (!first?.transcript) continue;
          assembled += first.transcript + (res?.isFinal ? " " : "");
        }
        const trimmed = assembled.trim();
        partialRef.current = trimmed;
        setPartial(trimmed);
      };

      recognition.onerror = (evt: SpeechRecognitionErrorEventLike) => {
        console.error('Speech recognition error:', evt.error);
        setState("error");
        const msg =
          evt.error === "not-allowed"
            ? "Microphone access was blocked. Please allow mic permissions for this site."
            : evt.error === "no-speech"
            ? "No speech detected. Please try again."
            : evt.error === "audio-capture"
            ? "No microphone found. Please check your device."
            : `Voice input error: ${evt.error || "unknown"}`;
        onPermissionError?.(msg);
      };

      recognition.onend = () => {
        const finalText = partialRef.current.trim();
        setState("idle");
        if (!finalText) {
          console.log('Speech recognition ended with no text');
          return;
        }
        console.log('Speech recognition ended with text:', finalText);
        translateText(finalText, targetLang)
          .then(({ translatedText, detectedLang }) => {
            console.log('Translation complete:', { translatedText, detectedLang });
            setResult({
              transcript: finalText,
              translated: translatedText || finalText,
              detectedLang,
            });
          })
          .catch((err) => {
            console.error('Translation error:', err);
            // Even if translation fails, return the original text
            setResult({
              transcript: finalText,
              translated: finalText,
              detectedLang: targetLang || 'en',
            });
            onError?.(err instanceof Error ? err.message : "Translation failed");
          });
      };

      recognition.start();
    } catch (err) {
      setState("error");
      onError?.(err instanceof Error ? err.message : "Unable to start voice input.");
    }
  }, [onError, onPermissionError, targetLang]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    state,
    partial,
    result,
    start,
    stop,
  };
}
