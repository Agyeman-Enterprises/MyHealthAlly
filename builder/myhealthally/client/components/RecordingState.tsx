import { Square, Mic } from "lucide-react";
import { useState, useEffect } from "react";

interface RecordingStateProps {
  isRecording: boolean;
  onStop?: () => void;
  onCancel?: () => void;
}

export default function RecordingState({
  isRecording,
  onStop,
  onCancel,
}: RecordingStateProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isRecording) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8 text-red-500" />
              {/* Pulsing animation */}
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Recording</h2>
          <p className="text-slate-600">
            Share your thoughts with your care team
          </p>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 rounded-lg px-8 py-4">
            <p className="text-4xl font-mono font-bold text-slate-900">
              {formatTime(seconds)}
            </p>
          </div>
        </div>

        {/* Waveform Animation */}
        <div className="flex justify-center items-center gap-1 h-16 mb-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-teal-500 to-teal-300 rounded-full"
              style={{
                height: `${30 + Math.random() * 40}px`,
                animation: `wave 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes wave {
              0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
              50% { transform: scaleY(1); opacity: 1; }
            }
          `}</style>
        </div>

        {/* Recording Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Speak clearly and naturally. Your recording
            will be transcribed and shared with your care team.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onStop}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4 fill-white" />
            Stop Recording
          </button>
        </div>
      </div>
    </div>
  );
}
