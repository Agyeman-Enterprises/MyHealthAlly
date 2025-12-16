'use client';

import { StatusLabelConfig } from '@/lib/status-labels/types';

interface StatusLabelProps {
  config: StatusLabelConfig;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: 'text-blue-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    icon: 'text-yellow-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: 'text-green-600',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: 'text-red-600',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    icon: 'text-gray-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    icon: 'text-purple-600',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

export function StatusLabel({
  config,
  size = 'md',
  showDescription = false,
  className = '',
}: StatusLabelProps) {
  const colors = colorClasses[config.color];
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border ${colors.bg} ${colors.border} ${sizeClass} ${className}`}
    >
      <span className={colors.icon}>{config.icon}</span>
      <span className={`font-medium ${colors.text}`}>{config.label}</span>
      {showDescription && (
        <span className={`text-xs ${colors.text} opacity-75`}>
          {config.description}
        </span>
      )}
    </div>
  );
}
