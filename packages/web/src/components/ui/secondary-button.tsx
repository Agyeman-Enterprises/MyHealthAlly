import * as React from "react"
import { cn } from "@/lib/utils"

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "bg-myh-surface border border-myh-border text-myh-textSoft hover:bg-myh-surfaceSoft hover:text-myh-text rounded-xl px-4 py-2 transition-all duration-200 font-medium",
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
SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton }

