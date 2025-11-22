import * as React from "react"
import { cn } from "@/lib/utils"

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, disabled, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          variant === 'default'
            ? "bg-myh-primary text-white hover:bg-teal-700 rounded-xl px-5 py-3 shadow-md shadow-teal-200/70 active:scale-95 disabled:opacity-60 transition-all duration-200 font-medium"
            : "bg-myh-surface border border-myh-border text-myh-text hover:bg-myh-surfaceSoft rounded-xl px-5 py-3 active:scale-95 disabled:opacity-60 transition-all duration-200 font-medium",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton }

