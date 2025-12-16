import {
  ProcessingStatus,
  ReviewOwnership,
  ClinicalActionState,
  MedicationStatus,
  UrgencyFlag,
  StatusLabelConfig,
} from './types';

/**
 * Status Label Configuration
 * 
 * Maps each status to its display configuration
 * Following Red Team principles:
 * - No clinical promises
 * - No "real-time" language
 * - Clear ownership
 * - Explicit human review
 * - Time delays framed as safety
 */

export const PROCESSING_STATUS_CONFIG: Record<ProcessingStatus, StatusLabelConfig> = {
  // Initial states (YELLOW)
  [ProcessingStatus.RECEIVED]: {
    label: 'Received',
    description: 'We\'ve received your information.',
    internalTooltip: 'Awaiting staff review.',
    patientFacing: 'We\'ve received your information.',
    color: 'yellow',
    icon: '📥',
    isTerminal: false,
    requiresAction: true,
  },
  [ProcessingStatus.IN_REVIEW]: {
    label: 'In Review',
    description: 'Your care team is reviewing this.',
    internalTooltip: 'Administrative review in progress.',
    patientFacing: 'Your care team is reviewing this.',
    color: 'yellow',
    icon: '👁️',
    isTerminal: false,
    requiresAction: true,
  },
  
  // Active processing (YELLOW)
  [ProcessingStatus.ROUTED_TO_CARE_TEAM]: {
    label: 'Routed to Care Team',
    description: 'Sent to your care team for review.',
    internalTooltip: 'Awaiting clinician review.',
    patientFacing: 'Sent to your care team for review.',
    color: 'yellow',
    icon: '🔄',
    isTerminal: false,
    requiresAction: true,
  },
  [ProcessingStatus.PENDING_CLINICIAN_REVIEW]: {
    label: 'Pending Clinician Review',
    description: 'Awaiting review by licensed clinician.',
    internalTooltip: '⚠️ High-Value Legal Label: No clinical action taken yet.',
    patientFacing: 'Awaiting review by your care team.',
    color: 'yellow',
    icon: '⏳',
    isTerminal: false,
    requiresAction: true,
  },
  
  // Action taken (GREEN)
  [ProcessingStatus.ACTION_TAKEN]: {
    label: 'Action Taken',
    description: 'Your care team has reviewed this.',
    internalTooltip: 'See clinical system for details.',
    patientFacing: 'Your care team has reviewed this.',
    color: 'green',
    icon: '✅',
    isTerminal: false,
    requiresAction: false,
  },
  [ProcessingStatus.FOLLOW_UP_SCHEDULED]: {
    label: 'Follow-Up Scheduled',
    description: 'Follow-up appointment or next step arranged.',
    internalTooltip: 'Follow-up documented.',
    patientFacing: 'Follow-up has been scheduled.',
    color: 'green',
    icon: '📅',
    isTerminal: false,
    requiresAction: false,
  },
  
  // Terminal states (GREEN)
  [ProcessingStatus.CLOSED]: {
    label: 'Closed',
    description: 'This item has been completed.',
    internalTooltip: 'No further action required.',
    patientFacing: 'This item has been completed.',
    color: 'green',
    icon: '🔒',
    isTerminal: true,
    requiresAction: false,
  },
  [ProcessingStatus.CLOSED_INFO_LOGGED]: {
    label: 'Closed — Information Logged',
    description: 'Information has been logged. No further action required.',
    internalTooltip: 'Information logged. No action required.',
    patientFacing: 'Information has been logged.',
    color: 'green',
    icon: '📝',
    isTerminal: true,
    requiresAction: false,
  },
  [ProcessingStatus.CLOSED_REVIEWED]: {
    label: 'Closed — Reviewed by Care Team',
    description: 'Reviewed by your care team. No further action required.',
    internalTooltip: 'Reviewed by care team. Closed.',
    patientFacing: 'Reviewed by your care team.',
    color: 'green',
    icon: '✅',
    isTerminal: true,
    requiresAction: false,
  },
  [ProcessingStatus.CLOSED_FOLLOW_UP_SCHEDULED]: {
    label: 'Closed — Follow-Up Scheduled',
    description: 'Follow-up scheduled. No further action required.',
    internalTooltip: 'Follow-up scheduled. Closed.',
    patientFacing: 'Follow-up has been scheduled.',
    color: 'green',
    icon: '📅',
    isTerminal: true,
    requiresAction: false,
  },
  [ProcessingStatus.CLOSED_NO_ACTION]: {
    label: 'Closed — No Action Required',
    description: 'No action required. Item closed.',
    internalTooltip: 'No action required. Closed.',
    patientFacing: 'No action required.',
    color: 'green',
    icon: '✓',
    isTerminal: true,
    requiresAction: false,
  },
  [ProcessingStatus.CLOSED_EMERGENCY_REDIRECT]: {
    label: 'Closed — Emergency Redirect Provided',
    description: 'Emergency guidance provided. Item closed.',
    internalTooltip: 'Emergency redirect provided. Closed.',
    patientFacing: 'Emergency guidance has been provided.',
    color: 'green',
    icon: '🚨',
    isTerminal: true,
    requiresAction: false,
  },
};

export const REVIEW_OWNERSHIP_CONFIG: Record<ReviewOwnership, StatusLabelConfig> = {
  [ReviewOwnership.MA_REVIEW]: {
    label: 'MA Review',
    description: 'Administrative intake and routing.',
    internalTooltip: 'Medical Assistant - Administrative intake and routing.',
    color: 'blue',
    icon: '👨‍⚕️',
    isTerminal: false,
    requiresAction: true,
  },
  [ReviewOwnership.FO_REVIEW]: {
    label: 'FO Review',
    description: 'Scheduling or insurance-related.',
    internalTooltip: 'Front Office - Scheduling or insurance-related.',
    color: 'blue',
    icon: '👩‍💼',
    isTerminal: false,
    requiresAction: true,
  },
  [ReviewOwnership.CLINICIAN_REVIEW_REQUIRED]: {
    label: 'Clinician Review Required',
    description: 'Licensed medical decision needed.',
    internalTooltip: '⚠️ Licensed medical decision needed.',
    color: 'purple',
    icon: '👨‍⚕️',
    isTerminal: false,
    requiresAction: true,
  },
  [ReviewOwnership.EXTERNAL_INFORMATION_ONLY]: {
    label: 'External Information Only',
    description: 'No action required unless clinician decides otherwise.',
    internalTooltip: '⚠️ No action required unless clinician decides otherwise. Prevents accidental assumption of responsibility.',
    color: 'gray',
    icon: '📄',
    isTerminal: false,
    requiresAction: false,
  },
};

export const CLINICAL_ACTION_STATE_CONFIG: Record<ClinicalActionState, StatusLabelConfig> = {
  // No clinical action yet (YELLOW)
  [ClinicalActionState.NO_CLINICAL_ACTION_TAKEN]: {
    label: 'No Clinical Action Taken',
    description: 'Information received. No medical decision made.',
    internalTooltip: '⚠️ Default state. No clinical action taken.',
    patientFacing: 'Information received. No medical decision made.',
    color: 'yellow',
    icon: '⏸️',
    isTerminal: false,
    requiresAction: true,
  },
  [ClinicalActionState.CLINICAL_REVIEW_REQUIRED]: {
    label: 'Clinical Review Required',
    description: 'Pending licensed clinician assessment.',
    internalTooltip: '⚠️ Pending licensed clinician assessment.',
    patientFacing: 'Awaiting review by licensed clinician.',
    color: 'yellow',
    icon: '👁️',
    isTerminal: false,
    requiresAction: true,
  },
  
  // Clinical actions taken (GREEN)
  [ClinicalActionState.REVIEWED_NO_CHANGE]: {
    label: 'Reviewed — No Change Recommended',
    description: 'Clinician reviewed; no change indicated.',
    internalTooltip: 'Clinician reviewed; no change indicated.',
    patientFacing: 'Reviewed by your care team. No change needed.',
    color: 'green',
    icon: '✅',
    isTerminal: true,
    requiresAction: false,
  },
  [ClinicalActionState.REVIEWED_FOLLOW_UP_NEEDED]: {
    label: 'Reviewed — Follow-Up Needed',
    description: 'Further evaluation required.',
    internalTooltip: 'Further evaluation required.',
    patientFacing: 'Your care team has reviewed this. Follow-up may be needed.',
    color: 'yellow',
    icon: '📋',
    isTerminal: false,
    requiresAction: true,
  },
  [ClinicalActionState.REVIEWED_ACTION_COMPLETED]: {
    label: 'Reviewed — Action Completed',
    description: 'Action completed in clinical system.',
    internalTooltip: '⚠️ Never say "Medication Updated" here. Always defer to clinical system.',
    patientFacing: 'Your care team has reviewed this. See your clinical records for details.',
    color: 'green',
    icon: '✅',
    isTerminal: true,
    requiresAction: false,
  },
};

/**
 * Medication-Specific Status Configuration
 * High-Risk Area
 */
export const MEDICATION_STATUS_CONFIG: Record<MedicationStatus, StatusLabelConfig> = {
  [MedicationStatus.MEDICATION_UPDATE_REPORTED]: {
    label: 'Medication Update Reported',
    description: 'Patient reports medication information.',
    internalTooltip: 'Patient-reported medication information. Requires verification.',
    patientFacing: 'Your medication information has been received.',
    color: 'yellow',
    icon: '💊',
    isTerminal: false,
    requiresAction: true,
  },
  [MedicationStatus.EXTERNAL_MEDICATION_CHANGE_UNVERIFIED]: {
    label: 'External Medication Change (Unverified)',
    description: 'Source: Hospital / outside provider. Awaiting verification.',
    internalTooltip: '⚠️ Unverified external medication change. Requires clinician confirmation.',
    patientFacing: 'Medication information from external source received. Under review.',
    color: 'yellow',
    icon: '🏥',
    isTerminal: false,
    requiresAction: true,
  },
  [MedicationStatus.PENDING_MEDICATION_REVIEW]: {
    label: 'Pending Medication Review',
    description: 'Awaiting clinician confirmation.',
    internalTooltip: 'Awaiting clinician confirmation before medication list update.',
    patientFacing: 'Awaiting review by your care team.',
    color: 'yellow',
    icon: '⏳',
    isTerminal: false,
    requiresAction: true,
  },
  [MedicationStatus.MEDICATION_REVIEW_COMPLETED]: {
    label: 'Medication Review Completed',
    description: 'Reviewed by clinician.',
    internalTooltip: 'Reviewed by clinician. See Solopractice for medication details.',
    patientFacing: 'Your care team has reviewed your medications.',
    color: 'green',
    icon: '✅',
    isTerminal: false,
    requiresAction: false,
  },
  [MedicationStatus.MEDICATION_CHANGES_IMPLEMENTED]: {
    label: 'Medication Changes Implemented',
    description: 'Implemented in Solopractice.',
    internalTooltip: '🛑 Implemented in Solopractice. Never display medication details here.',
    patientFacing: 'Your care team has reviewed your medications. See your clinical records for details.',
    color: 'green',
    icon: '✅',
    isTerminal: true,
    requiresAction: false,
  },
};

/**
 * Urgency Flag Configuration
 */
export const URGENCY_FLAG_CONFIG: Record<UrgencyFlag, { label: string; icon: string; color: 'red' | 'yellow' | 'gray' }> = {
  [UrgencyFlag.NONE]: {
    label: '',
    icon: '',
    color: 'gray',
  },
  [UrgencyFlag.TIME_SENSITIVE]: {
    label: 'Time-Sensitive',
    icon: '🟡',
    color: 'yellow',
  },
  [UrgencyFlag.ESCALATION_RECOMMENDED]: {
    label: 'Escalation Recommended',
    icon: '🔴',
    color: 'red',
  },
  [UrgencyFlag.EMERGENCY_REDIRECT_SENT]: {
    label: 'Emergency Redirect Sent',
    icon: '⚠️',
    color: 'red',
  },
};

/**
 * Get status label configuration
 */
export function getStatusLabelConfig(
  processingStatus: ProcessingStatus,
  reviewOwnership: ReviewOwnership,
  clinicalActionState: ClinicalActionState,
  medicationStatus?: MedicationStatus
): {
  processing: StatusLabelConfig;
  ownership: StatusLabelConfig;
  clinical: StatusLabelConfig;
  medication?: StatusLabelConfig;
} {
  return {
    processing: PROCESSING_STATUS_CONFIG[processingStatus],
    ownership: REVIEW_OWNERSHIP_CONFIG[reviewOwnership],
    clinical: CLINICAL_ACTION_STATE_CONFIG[clinicalActionState],
    medication: medicationStatus ? MEDICATION_STATUS_CONFIG[medicationStatus] : undefined,
  };
}

/**
 * STATUS LABELS YOU MUST NEVER USE
 * 
 * These phrases are legally dangerous and must never appear in the system:
 */
export const FORBIDDEN_STATUS_LABELS = [
  'Real-Time Updated',
  'Medication Changed',
  'Approved', // Use "Reviewed — Action Completed" instead
  'Diagnosed',
  'Treated',
  'Urgent Care Required',
  'Safe',
  'Unsafe',
  'Immediate',
  'Automatic',
  'Instant',
  'Active Now',
] as const;
