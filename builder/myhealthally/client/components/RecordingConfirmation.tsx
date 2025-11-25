import { CheckCircle, Mic, Edit2, Trash2, Send } from "lucide-react";
import { useState } from "react";

interface RecordingConfirmationProps {
  duration: number;
  transcript?: string;
  onSave?: () => void;
  onRetry?: () => void;
  onDiscard?: () => void;
}

export default function RecordingConfirmation({
  duration,
  transcript,
  onSave,
  onRetry,
  onDiscard,
}: RecordingConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(true);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Success State */}
        {isProcessing ? (
          <>
            {/* Processing */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-teal-500" />
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Processing your recording
              </h2>
              <p className="text-slate-600 text-sm">
                Transcribing audio and preparing summary...
              </p>
            </div>

            {/* Recording Details */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600 mb-2">Duration</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatTime(duration)}
              </p>
            </div>

            {/* Progress */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all"
                style={{ width: "75%", animation: "pulse 1.5s ease-in-out" }}
              />
            </div>

            <p className="text-xs text-slate-500 text-center">
              Please wait while we process your message...
            </p>
          </>
        ) : (
          <>
            {/* Success Confirmation */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Message ready!
              </h2>
              <p className="text-slate-600">
                Your recording has been processed and is ready to send
              </p>
            </div>

            {/* Recording Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-900">
                  Recording Details
                </p>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                  {formatTime(duration)}
                </span>
              </div>

              {transcript && (
                <p className="text-sm text-slate-700 mb-3">"{transcript}"</p>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Transcription complete
              </div>
            </div>

            {/* Summary Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-800">
                ✨ <strong>AI Summary</strong> will be generated when your care
                team reviews this message.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onSave}
                className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Re-record
                </button>
                <button
                  onClick={onDiscard}
                  className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
