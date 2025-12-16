/**
 * Solopractice Dashboard Color Mapping
 * 
 * Maps status labels to Solopractice RED/YELLOW/GREEN system
 */

import {
  ProcessingStatus,
  ReviewOwnership,
  ClinicalActionState,
  MedicationStatus,
  UrgencyLevel,
  UrgencyFlag,
  SolopracticeColor,
} from './types';
import { calculateSLAColor, SLA_RULES_BY_URGENCY } from './sla-rules';

/**
 * Map Processing Status to Solopractice Color
 */
export function getProcessingStatusColor(status: ProcessingStatus): SolopracticeColor {
  switch (status) {
    // YELLOW - In Progress/Pending
    case ProcessingStatus.RECEIVED:
    case ProcessingStatus.IN_REVIEW:
    case ProcessingStatus.ROUTED_TO_CARE_TEAM:
    case ProcessingStatus.PENDING_CLINICIAN_REVIEW:
      return 'YELLOW';
    
    // GREEN - Complete/Closed
    case ProcessingStatus.ACTION_TAKEN:
    case ProcessingStatus.FOLLOW_UP_SCHEDULED:
    case ProcessingStatus.CLOSED:
    case ProcessingStatus.CLOSED_INFO_LOGGED:
    case ProcessingStatus.CLOSED_REVIEWED:
    case ProcessingStatus.CLOSED_FOLLOW_UP_SCHEDULED:
    case ProcessingStatus.CLOSED_NO_ACTION:
    case ProcessingStatus.CLOSED_EMERGENCY_REDIRECT:
      return 'GREEN';
    
    default:
      return 'GRAY';
  }
}

/**
 * Map Urgency Flag to Solopractice Color
 */
export function getUrgencyFlagColor(flag: UrgencyFlag): SolopracticeColor | null {
  switch (flag) {
    case UrgencyFlag.TIME_SENSITIVE:
      return 'YELLOW';
    case UrgencyFlag.ESCALATION_RECOMMENDED:
    case UrgencyFlag.EMERGENCY_REDIRECT_SENT:
      return 'RED';
    case UrgencyFlag.NONE:
      return null; // No color override
    default:
      return null;
  }
}

/**
 * Get overall Solopractice color for a submission
 * Priority: Urgency Level (SLA Rules) > Urgency Flag > Processing Status
 */
export function getSolopracticeColor(
  processingStatus: ProcessingStatus,
  urgencyLevel: UrgencyLevel,
  urgencyFlag: UrgencyFlag,
  submittedAt?: Date,
  lastUpdatedAt?: Date
): SolopracticeColor {
  // SLA time-based rules based on urgency level (highest priority)
  if (submittedAt && lastUpdatedAt) {
    return calculateSLAColor(urgencyLevel, submittedAt, lastUpdatedAt, processingStatus, urgencyFlag);
  }
  
  // If no timestamps, use urgency level base color
  const rules = SLA_RULES_BY_URGENCY[urgencyLevel];
  if (rules) {
    return rules.color;
  }
  
  // Urgency flags override processing status
  const urgencyColor = getUrgencyFlagColor(urgencyFlag);
  if (urgencyColor) {
    return urgencyColor;
  }
  
  // Otherwise use processing status color
  return getProcessingStatusColor(processingStatus);
}

/**
 * Get Solopractice color class for UI
 */
export function getSolopracticeColorClass(color: SolopracticeColor): string {
  switch (color) {
    case 'RED':
      return 'bg-red-50 border-red-500 text-red-900';
    case 'YELLOW':
      return 'bg-yellow-50 border-yellow-500 text-yellow-900';
    case 'GREEN':
      return 'bg-green-50 border-green-500 text-green-900';
    case 'GRAY':
    default:
      return 'bg-gray-50 border-gray-500 text-gray-900';
  }
}
