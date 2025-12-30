import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useVoiceCapture } from "@/lib/hooks/useVoiceCapture";

type Props = {
  onComplete: (payload: { transcript: string; translated: string; detectedLang: string }) => void;
  onCancel?: () => void;
  targetLang?: string;
  title?: string;
};

export function VoiceConsole({ onComplete, onCancel, targetLang = "en", title }: Props) {
  const { state, partial, result, start, stop } = useVoiceCapture({
    targetLang,
    onPermissionError: (msg) => console.warn(msg),
    onError: (msg) => console.warn(msg),
  });

  useEffect(() => {
    if (result) {
      onComplete(result);
    }
  }, [result, onComplete]);

  const listening = state === "listening";

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-navy-600">{title || "Voice capture"}</p>
          <p className="text-xs text-gray-500">
            {listening ? "Listening…" : "Tap start and speak. Vietnamese auto-translated to English."}
          </p>
        </div>
        <div className="flex gap-2">
          {!listening ? (
            <Button type="button" size="sm" variant="primary" onClick={start}>
              Start
            </Button>
          ) : (
            <Button type="button" size="sm" variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {onCancel && (
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>
              Close
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-[80px] rounded-xl bg-gray-50 border border-dashed border-gray-200 p-3 text-sm text-gray-700">
        {partial ? partial : listening ? "Listening…" : "Waiting to start."}
      </div>
    </div>
  );
}
