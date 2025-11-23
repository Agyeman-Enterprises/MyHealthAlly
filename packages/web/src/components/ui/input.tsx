import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body mb-2"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex w-full border-radius px-4 py-3 text-body',
            'bg-surface border',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-secondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20',
            className
          )}
          style={{
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-body-size)',
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
          }}
          ref={ref}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-caption" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-caption" style={{ color: 'var(--color-textSecondary)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
