import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  clickable?: boolean;
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, children, glow = false, clickable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-myh-surface border border-myh-border rounded-xl p-4 transition-all duration-200",
          clickable && "cursor-pointer hover:shadow-lg hover:border-myh-primary/40",
          glow && clickable && "hover:bg-gradient-to-br hover:from-myh-primarySoft/50 hover:to-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlowCard.displayName = "GlowCard"

export { GlowCard }

