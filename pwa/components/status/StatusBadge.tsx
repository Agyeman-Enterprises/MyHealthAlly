'use client';

import { StatusLabelConfig } from '@/lib/status-labels/types';

interface StatusBadgeProps {
  config: StatusLabelConfig;
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function StatusBadge({ config, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClasses[config.color]} ${className}`}
      title={config.description}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
