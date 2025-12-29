/**
 * SLA Time Rules for Solopractice RED/YELLOW/GREEN System
 * 
 * URGENCY-BASED SLA RULES:
 * - EMERGENCY/URGENT (RED): 15min to respond, max 30min
 * - NORMAL (YELLOW): 24h to respond and close out
 * - ROUTINE (GREEN): 72h to close out
 * 
 * If not closed out in time:
 * - Alert triggered
 * - Timer starts counting
 * - Practice manager or MD needs to be made aware
 */

import { ProcessingStatus, UrgencyLevel, UrgencyFlag } from './types';
import type { SolopracticeColor } from './types';

/**
 * SLA Time Rules by Urgency Level
 */
export const SLA_RULES_BY_URGENCY = {
  /**
   * EMERGENCY/URGENT (RED)
   * Messages about chest pain, urgent symptoms
   * - 15 minutes: Initial response required (RED)
   * - 30 minutes: Maximum time before escalation (RED, critical)
   * - If not responded in 30min: Alert practice manager/MD
   */
  [UrgencyLevel.EMERGENCY]: {
    initialResponseWindowMs: 15 * 60 * 1000, // 15 minutes
    maxResponseTimeMs: 30 * 60 * 1000, // 30 minutes
    color: 'RED' as SolopracticeColor,
    requiresEscalationAfter: 30 * 60 * 1000, // Escalate after 30 minutes
    escalateTo: ['practice_manager', 'md'], // Alert practice manager or MD
  },
  [UrgencyLevel.URGENT]: {
    initialResponseWindowMs: 15 * 60 * 1000, // 15 minutes
    maxResponseTimeMs: 30 * 60 * 1000, // 30 minutes
    color: 'RED' as SolopracticeColor,
    requiresEscalationAfter: 30 * 60 * 1000, // Escalate after 30 minutes
    escalateTo: ['practice_manager', 'md'], // Alert practice manager or MD
  },
  
  /**
   * NORMAL (YELLOW)
   * AI triaged as MA-facing
   * - 24 hours: Must respond and close out
   * - If not closed in 24h: Alert and timer starts counting
   */
  [UrgencyLevel.NORMAL]: {
    initialResponseWindowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxResponseTimeMs: 24 * 60 * 60 * 1000, // 24 hours (same as initial)
    color: 'YELLOW' as SolopracticeColor,
    requiresEscalationAfter: 24 * 60 * 60 * 1000, // Escalate after 24 hours
    escalateTo: ['practice_manager'], // Alert practice manager
  },
  
  /**
   * ROUTINE (GREEN)
   * All others
   * - 72 hours: Must close out
   * - If not closed in 72h: Alert and timer starts counting, practice manager/MD needs to be aware
   */
  [UrgencyLevel.ROUTINE]: {
    initialResponseWindowMs: 72 * 60 * 60 * 1000, // 72 hours
    maxResponseTimeMs: 72 * 60 * 60 * 1000, // 72 hours (same as initial)
    color: 'GREEN' as SolopracticeColor,
    requiresEscalationAfter: 72 * 60 * 60 * 1000, // Escalate after 72 hours
    escalateTo: ['practice_manager', 'md'], // Alert practice manager or MD
  },
} as const;

/**
 * Calculate SLA status based on urgency level and elapsed time
 */
export function calculateSLAColor(
  urgencyLevel: UrgencyLevel,
  submittedAt: Date,
  lastUpdatedAt: Date,
  currentStatus: ProcessingStatus,
  urgencyFlag: UrgencyFlag
): SolopracticeColor {
  const rules = SLA_RULES_BY_URGENCY[urgencyLevel];
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _elapsedSinceSubmission = now.getTime() - submittedAt.getTime();
  const elapsedSinceUpdate = now.getTime() - lastUpdatedAt.getTime();

  // If already in a terminal state, return GREEN
  if (isTerminalState(currentStatus)) {
    return 'GREEN';
  }

  // Emergency redirect flag always RED
  if (urgencyFlag === UrgencyFlag.EMERGENCY_REDIRECT_SENT) {
    return 'RED';
  }

  // Check if max response time exceeded
  if (elapsedSinceUpdate >= rules.maxResponseTimeMs) {
    return 'RED'; // Critical - exceeded maximum
  }

  // For EMERGENCY/URGENT: Check 15-minute initial response
  if (urgencyLevel === UrgencyLevel.EMERGENCY || urgencyLevel === UrgencyLevel.URGENT) {
    if (elapsedSinceUpdate >= rules.initialResponseWindowMs) {
      return 'RED'; // RED if no response within 15 minutes
    }
  }

  // Return the base color for the urgency level
  return rules.color;
}

/**
 * Check if status is terminal (completed/closed)
 */
function isTerminalState(status: ProcessingStatus): boolean {
  return [
    ProcessingStatus.ACTION_TAKEN,
    ProcessingStatus.FOLLOW_UP_SCHEDULED,
    ProcessingStatus.CLOSED,
    ProcessingStatus.CLOSED_INFO_LOGGED,
    ProcessingStatus.CLOSED_REVIEWED,
    ProcessingStatus.CLOSED_FOLLOW_UP_SCHEDULED,
    ProcessingStatus.CLOSED_NO_ACTION,
    ProcessingStatus.CLOSED_EMERGENCY_REDIRECT,
  ].includes(status);
}

/**
 * Get SLA status message based on urgency level and elapsed time
 */
export function getSLAStatusMessage(
  urgencyLevel: UrgencyLevel,
  submittedAt: Date,
  lastUpdatedAt: Date
): {
  color: SolopracticeColor;
  message: string;
  isOverdue: boolean;
  requiresEscalation: boolean;
  escalateTo: string[];
} {
  const rules = SLA_RULES_BY_URGENCY[urgencyLevel];
  const now = new Date();
  const elapsedSinceSubmission = now.getTime() - submittedAt.getTime();
  const elapsedSinceUpdate = now.getTime() - lastUpdatedAt.getTime();

  // Check if max response time exceeded
  if (elapsedSinceUpdate >= rules.maxResponseTimeMs) {
    return {
      color: 'RED',
      message: `Critical: Exceeded ${formatTimeWindow(rules.maxResponseTimeMs)} maximum response time`,
      isOverdue: true,
      requiresEscalation: true,
      escalateTo: [...rules.escalateTo],
    };
  }

  // For EMERGENCY/URGENT: Check 15-minute initial response
  if (urgencyLevel === UrgencyLevel.EMERGENCY || urgencyLevel === UrgencyLevel.URGENT) {
    if (elapsedSinceUpdate >= rules.initialResponseWindowMs) {
      return {
        color: 'RED',
        message: `No response within ${formatTimeWindow(rules.initialResponseWindowMs)}. Escalation required.`,
        isOverdue: true,
        requiresEscalation: true,
        escalateTo: [...rules.escalateTo],
      };
    }
    
    // Within 15 minutes but approaching
    const timeRemaining = rules.initialResponseWindowMs - elapsedSinceUpdate;
    if (timeRemaining < 5 * 60 * 1000) { // Less than 5 minutes remaining
      return {
        color: 'RED',
        message: `Urgent: ${formatTimeRemaining(timeRemaining)} remaining to respond`,
        isOverdue: false,
        requiresEscalation: false,
        escalateTo: [],
      };
    }
    
    return {
      color: 'RED',
      message: `Emergency/Urgent: ${formatTimeRemaining(timeRemaining)} remaining to respond`,
      isOverdue: false,
      requiresEscalation: false,
      escalateTo: [],
    };
  }

  // For NORMAL: 24 hours
  if (urgencyLevel === UrgencyLevel.NORMAL) {
    if (elapsedSinceSubmission >= rules.maxResponseTimeMs) {
      return {
        color: 'YELLOW',
        message: `Overdue: Exceeded ${formatTimeWindow(rules.maxResponseTimeMs)} to respond and close out`,
        isOverdue: true,
        requiresEscalation: true,
        escalateTo: [...rules.escalateTo],
      };
    }
    
    const timeRemaining = rules.maxResponseTimeMs - elapsedSinceSubmission;
    return {
      color: 'YELLOW',
      message: `Normal: ${formatTimeRemaining(timeRemaining)} remaining to respond and close out`,
      isOverdue: false,
      requiresEscalation: false,
      escalateTo: [],
    };
  }

  // For ROUTINE: 72 hours
  if (urgencyLevel === UrgencyLevel.ROUTINE) {
    if (elapsedSinceSubmission >= rules.maxResponseTimeMs) {
      return {
        color: 'GREEN',
        message: `Overdue: Exceeded ${formatTimeWindow(rules.maxResponseTimeMs)} to close out`,
        isOverdue: true,
        requiresEscalation: true,
        escalateTo: [...rules.escalateTo],
      };
    }
    
    const timeRemaining = rules.maxResponseTimeMs - elapsedSinceSubmission;
    return {
      color: 'GREEN',
      message: `Routine: ${formatTimeRemaining(timeRemaining)} remaining to close out`,
      isOverdue: false,
      requiresEscalation: false,
      escalateTo: [],
    };
  }

  // Default
  return {
    color: rules.color,
    message: 'Within SLA',
    isOverdue: false,
    requiresEscalation: false,
    escalateTo: [],
  };
}

/**
 * Check if item requires escalation based on urgency level and SLA rules
 */
export function requiresEscalation(
  urgencyLevel: UrgencyLevel,
  submittedAt: Date,
  lastUpdatedAt: Date,
  currentStatus: ProcessingStatus
): {
  requires: boolean;
  escalateTo: string[];
  reason: string;
} {
  // Terminal states don't require escalation
  if (isTerminalState(currentStatus)) {
    return {
      requires: false,
      escalateTo: [],
      reason: 'Item is in terminal state',
    };
  }

  const rules = SLA_RULES_BY_URGENCY[urgencyLevel];
  const now = new Date();
  const elapsedSinceUpdate = now.getTime() - lastUpdatedAt.getTime();

  // Check if max response time exceeded
  if (elapsedSinceUpdate >= rules.requiresEscalationAfter) {
    return {
      requires: true,
      escalateTo: [...rules.escalateTo],
      reason: `Exceeded ${formatTimeWindow(rules.requiresEscalationAfter)} maximum response time`,
    };
  }

  return {
    requires: false,
    escalateTo: [],
    reason: 'Within SLA',
  };
}

/**
 * Get time remaining until next SLA threshold
 */
export function getTimeUntilNextSLAThreshold(
  urgencyLevel: UrgencyLevel,
  submittedAt: Date,
  lastUpdatedAt: Date
): {
  threshold: string;
  timeRemaining: number; // milliseconds
  isUrgent: boolean;
  color: SolopracticeColor;
} {
  const rules = SLA_RULES_BY_URGENCY[urgencyLevel];
  const now = new Date();
  const elapsedSinceSubmission = now.getTime() - submittedAt.getTime();
  const elapsedSinceUpdate = now.getTime() - lastUpdatedAt.getTime();

  // For EMERGENCY/URGENT: Check 15-minute initial response first
  if (urgencyLevel === UrgencyLevel.EMERGENCY || urgencyLevel === UrgencyLevel.URGENT) {
    const timeUntil15Min = rules.initialResponseWindowMs - elapsedSinceUpdate;
    if (timeUntil15Min > 0) {
      return {
        threshold: '15 minutes (initial response)',
        timeRemaining: timeUntil15Min,
        isUrgent: timeUntil15Min < 5 * 60 * 1000, // Urgent if less than 5 minutes
        color: 'RED',
      };
    }
    
    // Then check 30-minute max
    const timeUntil30Min = rules.maxResponseTimeMs - elapsedSinceUpdate;
    if (timeUntil30Min > 0) {
      return {
        threshold: '30 minutes (maximum)',
        timeRemaining: timeUntil30Min,
        isUrgent: true, // Always urgent if past 15 minutes
        color: 'RED',
      };
    }
    
    // Exceeded
    return {
      threshold: 'Exceeded 30 minutes',
      timeRemaining: 0,
      isUrgent: true,
      color: 'RED',
    };
  }

  // For NORMAL: 24 hours
  if (urgencyLevel === UrgencyLevel.NORMAL) {
    const timeUntil24H = rules.maxResponseTimeMs - elapsedSinceSubmission;
    if (timeUntil24H > 0) {
      return {
        threshold: '24 hours (respond and close)',
        timeRemaining: timeUntil24H,
        isUrgent: timeUntil24H < 2 * 60 * 60 * 1000, // Urgent if less than 2 hours
        color: 'YELLOW',
      };
    }
    
    return {
      threshold: 'Exceeded 24 hours',
      timeRemaining: 0,
      isUrgent: true,
      color: 'YELLOW',
    };
  }

  // For ROUTINE: 72 hours
  if (urgencyLevel === UrgencyLevel.ROUTINE) {
    const timeUntil72H = rules.maxResponseTimeMs - elapsedSinceSubmission;
    if (timeUntil72H > 0) {
      return {
        threshold: '72 hours (close out)',
        timeRemaining: timeUntil72H,
        isUrgent: timeUntil72H < 24 * 60 * 60 * 1000, // Urgent if less than 24 hours
        color: 'GREEN',
      };
    }
    
    return {
      threshold: 'Exceeded 72 hours',
      timeRemaining: 0,
      isUrgent: true,
      color: 'GREEN',
    };
  }

  // Default
  return {
    threshold: 'Unknown',
    timeRemaining: 0,
    isUrgent: false,
    color: 'GRAY',
  };
}

/**
 * Format time window for display
 */
function formatTimeWindow(ms: number): string {
  const minutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  
  if (days > 0) {
    return `${days} hour${days !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Format time remaining for display
 */
function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get countdown timer data for display
 */
export function getCountdownTimer(
  urgencyLevel: UrgencyLevel,
  submittedAt: Date,
  lastUpdatedAt: Date
): {
  timeRemaining: number;
  formatted: string;
  isUrgent: boolean;
  isOverdue: boolean;
  color: SolopracticeColor;
} {
  const rules = SLA_RULES_BY_URGENCY[urgencyLevel];
  const now = new Date();
  const elapsedSinceUpdate = now.getTime() - lastUpdatedAt.getTime();
  const elapsedSinceSubmission = now.getTime() - submittedAt.getTime();

  // For EMERGENCY/URGENT: Use lastUpdatedAt (response time)
  if (urgencyLevel === UrgencyLevel.EMERGENCY || urgencyLevel === UrgencyLevel.URGENT) {
    const timeRemaining = rules.maxResponseTimeMs - elapsedSinceUpdate;
    const isOverdue = timeRemaining <= 0;
    
    return {
      timeRemaining: Math.max(0, timeRemaining),
      formatted: isOverdue ? `Overdue by ${formatTimeRemaining(-timeRemaining)}` : formatTimeRemaining(timeRemaining),
      isUrgent: timeRemaining < 5 * 60 * 1000 || isOverdue, // Urgent if less than 5 minutes or overdue
      isOverdue,
      color: isOverdue ? 'RED' : 'RED',
    };
  }

  // For NORMAL/ROUTINE: Use submittedAt (close-out time)
  const timeRemaining = rules.maxResponseTimeMs - elapsedSinceSubmission;
  const isOverdue = timeRemaining <= 0;
  
  return {
    timeRemaining: Math.max(0, timeRemaining),
    formatted: isOverdue ? `Overdue by ${formatTimeRemaining(-timeRemaining)}` : formatTimeRemaining(timeRemaining),
    isUrgent: timeRemaining < (rules.maxResponseTimeMs * 0.1) || isOverdue, // Urgent if less than 10% remaining or overdue
    isOverdue,
    color: isOverdue ? 'RED' : rules.color,
  };
}
