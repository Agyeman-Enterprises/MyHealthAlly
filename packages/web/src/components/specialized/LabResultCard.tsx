import React from 'react';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

export interface LabResultCardProps {
  testName: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
  date: string;
  className?: string;
}

export const LabResultCard: React.FC<LabResultCardProps> = ({
  testName,
  value,
  unit,
  referenceRange,
  status,
  date,
  className,
}) => {
  const statusColors = {
    normal: 'var(--color-success)',
    abnormal: 'var(--color-warning)',
    critical: 'var(--color-danger)',
  };

  return (
    <Card className={cn('border-l-4', className)} padding="md" style={{
      borderLeftColor: statusColors[status],
    }}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>
          {testName}
        </span>
        <span
          className="px-2 py-1 text-caption border-radius"
          style={{
            backgroundColor: statusColors[status] + '20',
            color: statusColors[status],
            borderRadius: 'var(--radius)',
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-h2" style={{ color: 'var(--color-textPrimary)' }}>
          {value}
        </span>
        {unit && (
          <span className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            {unit}
          </span>
        )}
      </div>
      {referenceRange && (
        <div className="text-caption mb-2" style={{ color: 'var(--color-textSecondary)' }}>
          Reference: {referenceRange}
        </div>
      )}
      <div className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
        {date}
      </div>
    </Card>
  );
};

