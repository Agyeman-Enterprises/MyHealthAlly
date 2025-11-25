'use client';

import { useMemo } from 'react';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  onRecordStart?: () => void;
  onRecordStop?: () => void;
  isRecording?: boolean;
  disabled?: boolean;
  label?: string;
  recordingLabel?: string;
}

export function RecordButton({
  onRecordStart,
  onRecordStop,
  isRecording = false,
  disabled = false,
  label = 'Record a message',
  recordingLabel = 'Stop recording',
}: RecordButtonProps) {
  const stateLabel = useMemo(() => {
    if (disabled) return 'Unavailable';
    return isRecording ? recordingLabel : label;
  }, [disabled, isRecording, label, recordingLabel]);

  const handleClick = () => {
    if (disabled) return;
    if (isRecording) {
      onRecordStop?.();
    } else {
      onRecordStart?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-red-300'
            : isRecording
            ? 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/50 scale-105'
            : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95'
        }`}
      >
        {isRecording && !disabled && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-red-400 opacity-40 animate-ping" />
          </>
        )}
        {isRecording ? (
          <Square className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </button>

      <p className="text-sm font-medium text-myh-textPrimary text-center">{stateLabel}</p>
    </div>
  );
}

