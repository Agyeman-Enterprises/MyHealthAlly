'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/primary-button';

type Props = {
  hintText?: string;
};

export function PatientVoiceCapture({ hintText = 'Speak to MyHealthAlly' }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessing(true);
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <button
              onClick={handleToggleRecording}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : isProcessing
                  ? 'bg-myh-primarySoft'
                  : 'bg-myh-primary hover:bg-myh-primary/90'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-myh-primary animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
            )}
          </div>
          <p className="text-sm text-myh-textSoft text-center">
            {isRecording
              ? 'Recording... Click to stop'
              : isProcessing
              ? 'Processing your voice...'
              : hintText}
          </p>
          {isRecording && (
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 h-8 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

