import { Mic, Square } from "lucide-react";
import { useState } from "react";

interface RecordButtonProps {
  onRecordStart?: () => void;
  onRecordStop?: () => void;
  isRecording?: boolean;
}

export default function RecordButton({
  onRecordStart,
  onRecordStop,
  isRecording = false,
}: RecordButtonProps) {
  const [isActive, setIsActive] = useState(isRecording);

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
      onRecordStop?.();
    } else {
      setIsActive(true);
      onRecordStart?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleToggle}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
          isActive
            ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50"
            : "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/40"
        }`}
      >
        <div className="relative">
          {isActive && (
            <>
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
              <div className="absolute inset-2 rounded-full bg-red-300 animate-pulse opacity-50" />
            </>
          )}

          {isActive ? (
            <Square className="w-10 h-10 text-white fill-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </div>
      </button>

      <p className="text-sm font-medium text-slate-900">
        {isActive ? "Stop recording" : "Record a message"}
      </p>

      {isActive && (
        <p className="text-xs text-slate-500 animate-pulse">
          Recording in progress...
        </p>
      )}
    </div>
  );
}
