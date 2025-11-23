import React from 'react';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

export interface VitalCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'high' | 'low' | 'warning';
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: string;
  className?: string;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  label,
  value,
  unit,
  status = 'normal',
  trend,
  lastUpdated,
  className,
}) => {
  const statusColors = {
    normal: 'var(--color-success)',
    high: 'var(--color-danger)',
    low: 'var(--color-warning)',
    warning: 'var(--color-warning)',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <Card className={cn('relative', className)} padding="md">
      <div className="flex items-start justify-between mb-2">
        <span className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
          {label}
        </span>
        {trend && (
          <span
            className="text-lg"
            style={{
              color: trend === 'up' ? 'var(--color-accentGreen)' : trend === 'down' ? 'var(--color-danger)' : 'var(--color-textSecondary)',
            }}
          >
            {trendIcons[trend]}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-h2" style={{ color: 'var(--color-textPrimary)' }}>
          {value}
        </span>
        {unit && (
          <span className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            {unit}
          </span>
        )}
      </div>
      {status !== 'normal' && (
        <div
          className="mt-2 text-caption"
          style={{ color: statusColors[status] }}
        >
          {status === 'high' ? 'High' : status === 'low' ? 'Low' : 'Warning'}
        </div>
      )}
      {lastUpdated && (
        <div className="mt-2 text-caption" style={{ color: 'var(--color-textSecondary)' }}>
          Updated {lastUpdated}
        </div>
      )}
    </Card>
  );
};

