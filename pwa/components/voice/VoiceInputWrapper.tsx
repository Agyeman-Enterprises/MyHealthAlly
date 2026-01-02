'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { VoiceInputButton } from './VoiceInputButton';
import { useAuthStore } from '@/lib/store/auth-store';

interface VoiceInputWrapperProps {
  children: ReactNode;
  value: string;
  onChange: (value: string) => void;
  language?: string;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputWrapper({
  children,
  onChange,
  language,
  disabled = false,
  className = '',
}: VoiceInputWrapperProps) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const { user } = useAuthStore();

  const handleTranscript = (text: string) => {
    if (inputRef.current) {
      const currentValue = inputRef.current.value || '';
      const newValue = currentValue ? `${currentValue} ${text}` : text;
      
      if (inputRef.current instanceof HTMLTextAreaElement || inputRef.current instanceof HTMLInputElement) {
        inputRef.current.value = newValue;
        const event = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(event);
      }
      
      onChange(newValue);
    } else {
      onChange(text);
    }
  };

  const handleRecordingChange = (isRecording: boolean) => {
    if (inputRef.current) {
      if (isRecording) {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    if (typeof children === 'object' && children !== null && 'props' in children) {
      const childProps = (children as any).props;
      if (childProps.ref) {
        inputRef.current = childProps.ref.current;
      }
    }
  }, [children]);

  const userLanguage = language || user?.preferred_language || 'en-US';

  const childrenWithRef = typeof children === 'object' && children !== null
    ? {
        ...children,
        props: {
          ...(children as any).props,
          ref: (node: HTMLTextAreaElement | HTMLInputElement | null) => {
            inputRef.current = node;
            const originalRef = (children as any).props?.ref;
            if (typeof originalRef === 'function') {
              originalRef(node);
            } else if (originalRef) {
              originalRef.current = node;
            }
          },
        },
      }
    : children;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {childrenWithRef}
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          <VoiceInputButton
            onTranscript={handleTranscript}
            onRecordingChange={handleRecordingChange}
            language={userLanguage}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

