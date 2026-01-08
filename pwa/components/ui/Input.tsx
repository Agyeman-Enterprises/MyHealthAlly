'use client';

import React, { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { parseDateFromVoice } from '@/lib/utils/voice-date-parser';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  enableVoice?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  error,
  helperText,
  icon,
  className,
  enableVoice = true,
  value,
  onChange,
  ...props
}, ref) {
  const [inputValue, setInputValue] = useState(value || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    // Parse the transcript based on input type
    // IMPORTANT: Replace field value (don't append) - each field gets its own voice input
    let parsedValue = text;
    
    if (props.type === 'date') {
      // Use date parser for date fields - handles mmddyyyy, natural language, etc.
      const parsedDate = parseDateFromVoice(text);
      parsedValue = parsedDate || text;
    } else if (props.type === 'tel') {
      // Format phone numbers
      const phoneDigits = text.replace(/\D/g, '');
      if (phoneDigits.length === 10) {
        parsedValue = `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
      } else {
        parsedValue = text;
      }
    } else if (props.type === 'email') {
      // Extract email if present
      const emailMatch = text.match(/\b[\w\.-]+@[\w\.-]+\.\w+\b/i);
      parsedValue = emailMatch ? emailMatch[0] : text;
    } else if (props.type === 'number') {
      // Extract numbers only
      parsedValue = text.replace(/\D/g, '');
    }
    
    // Replace the field value (don't append) - each field gets its own voice input
    setInputValue(parsedValue);
    if (onChange) {
      const syntheticEvent = {
        target: { value: parsedValue },
        currentTarget: { value: parsedValue },
      } as React.ChangeEvent<HTMLInputElement>;
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
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={props.id}
          name={props.name}
          value={value !== undefined ? value : inputValue}
          onChange={handleChange}
          disabled={props.disabled}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none',
            'focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200',
            icon ? 'pl-12' : '',
            enableVoice ? 'pr-12' : '',
            props.disabled ? 'bg-gray-50 cursor-not-allowed' : '',
            className
          )}
          {...props}
        />
        {enableVoice && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
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
});
