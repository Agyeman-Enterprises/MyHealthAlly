import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export interface AppointmentCardProps {
  date: string;
  time: string;
  provider: string;
  type: 'virtual' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
  onJoin?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  date,
  time,
  provider,
  type,
  status,
  reason,
  onJoin,
  onCancel,
  className,
}) => {
  return (
    <Card className={cn(className)} padding="md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-h3 mb-1" style={{ color: 'var(--color-textPrimary)' }}>
            {date}
          </div>
          <div className="text-body mb-1" style={{ color: 'var(--color-textSecondary)' }}>
            {time}
          </div>
          <div className="text-body" style={{ color: 'var(--color-textPrimary)' }}>
            {provider}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className="px-2 py-1 text-caption border-radius"
            style={{
              backgroundColor: type === 'virtual' ? 'var(--color-primary)' + '20' : 'var(--color-secondary)' + '20',
              color: type === 'virtual' ? 'var(--color-primary)' : 'var(--color-secondary)',
              borderRadius: 'var(--radius)',
            }}
          >
            {type === 'virtual' ? 'Virtual' : 'In-Person'}
          </span>
          <span
            className="px-2 py-1 text-caption border-radius"
            style={{
              backgroundColor: status === 'scheduled' ? 'var(--color-success)' + '20' : status === 'completed' ? 'var(--color-textSecondary)' + '20' : 'var(--color-danger)' + '20',
              color: status === 'scheduled' ? 'var(--color-success)' : status === 'completed' ? 'var(--color-textSecondary)' : 'var(--color-danger)',
              borderRadius: 'var(--radius)',
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
      {reason && (
        <div className="text-body mb-3" style={{ color: 'var(--color-textSecondary)' }}>
          {reason}
        </div>
      )}
      {status === 'scheduled' && (
        <div className="flex gap-2 mt-4">
          {type === 'virtual' && onJoin && (
            <Button variant="primary" size="sm" onClick={onJoin}>
              Join Visit
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

