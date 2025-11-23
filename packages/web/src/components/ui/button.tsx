import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      borderRadius: 'var(--radius)',
      fontFamily: 'var(--font-family)',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: 'none',
      outline: 'none',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
      },
      secondary: {
        backgroundColor: 'var(--color-secondary)',
        color: '#FFFFFF',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-textPrimary)',
      },
      danger: {
        backgroundColor: 'var(--color-danger)',
        color: '#FFFFFF',
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: '6px 12px',
        fontSize: '14px',
      },
      md: {
        padding: '10px 20px',
        fontSize: '16px',
      },
      lg: {
        padding: '14px 28px',
        fontSize: '18px',
      },
      icon: {
        padding: '10px',
        fontSize: '16px',
        width: '40px',
        height: '40px',
      },
    };

    const style = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };

    return (
      <button
        className={cn(
          'hover:opacity-90 active:scale-95',
          className
        )}
        style={style}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
