'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertSeverity } from '@myhealthally/shared';
import { X } from 'lucide-react';
import { Button } from './button';

interface AlertBannerProps {
  severity: AlertSeverity;
  title: string;
  body: string;
  onDismiss?: () => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AlertBanner({
  severity,
  title,
  body,
  onDismiss,
  primaryAction,
  secondaryAction,
  className,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isDismissing, setIsDismissing] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  const severityStyles = {
    [AlertSeverity.INFO]: 'bg-blue-50 border-blue-200 text-blue-900',
    [AlertSeverity.WARNING]: 'bg-amber-50 border-amber-200 text-amber-800',
    [AlertSeverity.CRITICAL]: 'bg-error/10 border-error text-error',
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 animate-slide-in',
        severityStyles[severity],
        isDismissing && 'opacity-0 translate-x-full transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              severity === AlertSeverity.CRITICAL ? 'bg-error' :
              severity === AlertSeverity.WARNING ? 'bg-amber-500' :
              'bg-blue-500'
            )} />
            <h4 className="font-semibold">{title}</h4>
          </div>
          <p className="text-sm mb-3">{body}</p>
          {(primaryAction || secondaryAction) && (
            <div className="flex gap-2">
              {primaryAction && (
                <Button
                  size="sm"
                  onClick={primaryAction.onClick}
                  className="btn-press"
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={secondaryAction.onClick}
                  className="btn-press"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

