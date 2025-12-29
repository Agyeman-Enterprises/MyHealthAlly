'use client';

import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusMessageProps {
  status: 'submitted' | 'under_review' | 'review_pending' | 'processing' | 'completed' | 'error';
  message?: string;
  className?: string;
}

const statusConfig = {
  submitted: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultMessage: 'Submitted for clinician review',
  },
  under_review: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultMessage: 'Under review by your care team',
  },
  review_pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    defaultMessage: 'Review pending - processing may take time',
  },
  processing: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    defaultMessage: 'Processing may take time. You will be notified of next steps.',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    defaultMessage: 'Completed - your care team has updated your records',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    defaultMessage: 'An error occurred. Please try again or contact support.',
  },
};

export function StatusMessage({ status, message, className = '' }: StatusMessageProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg p-4 border-l-4 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
        <p className={`text-sm font-medium ${config.color.replace('text-', 'text-').replace('-600', '-900')}`}>
          {message || config.defaultMessage}
        </p>
      </div>
    </div>
  );
}
