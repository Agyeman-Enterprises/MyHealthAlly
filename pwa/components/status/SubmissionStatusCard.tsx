'use client';

import type { SubmissionStatus } from '@/lib/status-labels/types';
import { getStatusLabelConfig } from '@/lib/status-labels/config';
import { getSolopracticeColor, getSolopracticeColorClass } from '@/lib/status-labels/solopractice-mapping';
import { getSLAStatusMessage, getTimeUntilNextSLAThreshold, requiresEscalation, getCountdownTimer } from '@/lib/status-labels/sla-rules';
import { StatusLabel } from './StatusLabel';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';

// Helper function to format time remaining (unused but kept for potential future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

interface SubmissionStatusCardProps {
  status: SubmissionStatus;
  title?: string;
  showAllDimensions?: boolean;
  className?: string;
}

export function SubmissionStatusCard({
  status,
  title = 'Status',
  showAllDimensions = true,
  className = '',
}: SubmissionStatusCardProps) {
  const configs = getStatusLabelConfig(
    status.processingStatus,
    status.reviewOwnership,
    status.clinicalActionState,
    status.medicationStatus
  );
  
  // Get Solopractice color (with urgency-based SLA rules)
  const solopracticeColor = getSolopracticeColor(
    status.processingStatus,
    status.urgencyLevel,
    status.urgencyFlag,
    status.submittedAt,
    status.lastUpdatedAt
  );
  const colorClass = getSolopracticeColorClass(solopracticeColor);
  
  // Get SLA status message (urgency-based)
  const slaStatus = getSLAStatusMessage(status.urgencyLevel, status.submittedAt, status.lastUpdatedAt);
  const timeUntilThreshold = getTimeUntilNextSLAThreshold(status.urgencyLevel, status.submittedAt, status.lastUpdatedAt);
  const escalationInfo = requiresEscalation(status.urgencyLevel, status.submittedAt, status.lastUpdatedAt, status.processingStatus);
  
  // Countdown timer (updates every minute)
  const [countdown, setCountdown] = useState(() => 
    getCountdownTimer(status.urgencyLevel, status.submittedAt, status.lastUpdatedAt)
  );
  
  useEffect(() => {
    if (!configs.processing.isTerminal) {
      const interval = setInterval(() => {
        setCountdown(getCountdownTimer(status.urgencyLevel, status.submittedAt, status.lastUpdatedAt));
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [status.urgencyLevel, status.submittedAt, status.lastUpdatedAt, configs.processing.isTerminal]);


  return (
    <Card variant="elevated" className={`${className} border-l-4 ${colorClass.split(' ')[0]}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {/* Urgency Level Badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              status.urgencyLevel === 'emergency' || status.urgencyLevel === 'urgent' ? 'bg-red-100 text-red-800' :
              status.urgencyLevel === 'normal' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {status.urgencyLevel === 'emergency' && '🚨 EMERGENCY'}
              {status.urgencyLevel === 'urgent' && '🔴 URGENT'}
              {status.urgencyLevel === 'normal' && '🟡 NORMAL'}
              {status.urgencyLevel === 'routine' && '✅ ROUTINE'}
            </span>
            
            {/* Solopractice Color Indicator */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
              {solopracticeColor === 'RED' && '🔴'}
              {solopracticeColor === 'YELLOW' && '🟡'}
              {solopracticeColor === 'GREEN' && '✅'}
              {solopracticeColor}
            </span>
            {/* Urgency Flags */}
            {status.urgencyFlag !== 'none' && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                status.urgencyFlag === 'time_sensitive' ? 'bg-yellow-100 text-yellow-800' :
                status.urgencyFlag === 'escalation_recommended' ? 'bg-red-100 text-red-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status.urgencyFlag === 'time_sensitive' && '🟡 Time-Sensitive'}
                {status.urgencyFlag === 'escalation_recommended' && '🔴 Escalation Recommended'}
                {status.urgencyFlag === 'emergency_redirect_sent' && '⚠️ Emergency Redirect Sent'}
              </span>
            )}
          </div>
        </div>

        {/* Processing Status (Primary) */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Processing Status
          </label>
          <StatusLabel config={configs.processing} size="md" />
          <p className="text-xs text-gray-600 mt-1">
            {configs.processing.description}
          </p>
        </div>

        {/* Review Ownership (if showing all dimensions) */}
        {showAllDimensions && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Review Ownership
            </label>
            <StatusLabel config={configs.ownership} size="sm" />
            <p className="text-xs text-gray-600 mt-1">
              {configs.ownership.description}
            </p>
          </div>
        )}

        {/* Clinical Action State (if showing all dimensions) */}
        {showAllDimensions && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Clinical Action
            </label>
            <StatusLabel config={configs.clinical} size="sm" />
            <p className="text-xs text-gray-600 mt-1">
              {configs.clinical.description}
            </p>
            {configs.clinical.internalTooltip && (
              <p className="text-xs text-yellow-700 mt-1 font-medium">
                ⚠️ {configs.clinical.internalTooltip}
              </p>
            )}
          </div>
        )}
        
        {/* Medication Status (if medication-related) */}
        {configs.medication && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
              Medication Status
            </label>
            <StatusLabel config={configs.medication} size="sm" />
            <p className="text-xs text-gray-600 mt-1">
              {configs.medication.description}
            </p>
            {configs.medication.internalTooltip && (
              <p className="text-xs text-yellow-700 mt-1 font-medium">
                ⚠️ {configs.medication.internalTooltip}
              </p>
            )}
          </div>
        )}

        {/* SLA Status & Countdown Timer */}
        {!configs.processing.isTerminal && (
          <div className={`pt-2 border-t ${slaStatus.color === 'RED' ? 'border-red-200' : slaStatus.color === 'YELLOW' ? 'border-yellow-200' : 'border-gray-200'}`}>
            <div className={`p-3 rounded ${slaStatus.color === 'RED' ? 'bg-red-50' : slaStatus.color === 'YELLOW' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${slaStatus.color === 'RED' ? 'text-red-900' : slaStatus.color === 'YELLOW' ? 'text-yellow-900' : 'text-gray-900'}`}>
                  {slaStatus.message}
                </span>
                {escalationInfo.requires && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    🔴 Escalation Required
                  </span>
                )}
              </div>
              
              {/* Countdown Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    countdown.isOverdue ? 'text-red-600' :
                    countdown.isUrgent ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    {countdown.formatted}
                  </span>
                  {countdown.isOverdue && (
                    <span className="text-xs text-red-600 font-medium">OVERDUE</span>
                  )}
                </div>
                {escalationInfo.requires && escalationInfo.escalateTo.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Alert: {escalationInfo.escalateTo.map(r => r === 'practice_manager' ? 'Practice Manager' : 'MD').join(' or ')}
                  </div>
                )}
              </div>
              
              {timeUntilThreshold.timeRemaining > 0 && !countdown.isOverdue && (
                <div className="mt-2 text-xs text-gray-600">
                  Next threshold: {timeUntilThreshold.threshold}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-2 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Submitted:</span>
            <span>{new Date(status.submittedAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Last Updated:</span>
            <span>{new Date(status.lastUpdatedAt).toLocaleString()}</span>
          </div>
          {status.assignedTo && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Assigned To:</span>
              <span>{status.assignedTo}</span>
            </div>
          )}
          {status.estimatedCompletionTime && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Estimated Completion:</span>
              <span>
                {new Date(status.estimatedCompletionTime).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
