'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { VoiceInput } from '@/components/voice/VoiceInput';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  enableVoice?: boolean;
}

export function TextArea({
  label,
  error,
  helperText,
  className,
  enableVoice = true,
  value,
  onChange,
  ...props
}: TextAreaProps) {
  const [textareaValue, setTextareaValue] = useState(value || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setTextareaValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    const currentValue = value !== undefined ? String(value) : textareaValue;
    const newValue = currentValue ? `${currentValue} ${text}` : text;
    setTextareaValue(newValue);
    if (onChange) {
      const syntheticEvent = {
        target: { value: newValue },
        currentTarget: { value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={props.id}
          name={props.name}
          value={value !== undefined ? value : textareaValue}
          onChange={handleChange}
          disabled={props.disabled}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none resize-none',
            'focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200',
            enableVoice ? 'pr-12 pb-12' : '',
            props.disabled ? 'bg-gray-50 cursor-not-allowed' : '',
            className
          )}
          {...props}
        />
        {enableVoice && (
          <div className="absolute right-2 bottom-2 z-10">
            <VoiceInput onTranscript={handleVoiceTranscript} size="sm" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

