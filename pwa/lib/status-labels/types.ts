/**
 * MyHealth Ally Dashboard Status Label System
 * 
 * Three parallel dimensions:
 * 1. Processing Status (where it is in workflow)
 * 2. Review Ownership (who must act)
 * 3. Clinical Action State (what has or hasn't happened)
 */

/**
 * Processing Status - Where the item is in the workflow
 * Maps to Solopractice RED/YELLOW/GREEN system
 */
export enum ProcessingStatus {
  // Initial states (YELLOW)
  RECEIVED = 'received',                    // Patient submission logged
  IN_REVIEW = 'in_review',                  // MA/FO actively reviewing
  
  // Active processing (YELLOW)
  ROUTED_TO_CARE_TEAM = 'routed_to_care_team', // Sent to clinician/queue
  PENDING_CLINICIAN_REVIEW = 'pending_clinician_review', // Awaiting licensed clinician
  
  // Action taken (GREEN)
  ACTION_TAKEN = 'action_taken',            // Clinician reviewed and acted
  FOLLOW_UP_SCHEDULED = 'follow_up_scheduled', // Appointment/next step arranged
  
  // Terminal states (GREEN)
  CLOSED = 'closed',                        // Workflow complete
  CLOSED_INFO_LOGGED = 'closed_info_logged',
  CLOSED_REVIEWED = 'closed_reviewed',
  CLOSED_FOLLOW_UP_SCHEDULED = 'closed_follow_up_scheduled',
  CLOSED_NO_ACTION = 'closed_no_action',
  CLOSED_EMERGENCY_REDIRECT = 'closed_emergency_redirect',
}

/**
 * Review Ownership - Who must act next
 * Internal only — never patient-facing
 * ⚠️ This prevents accidental assumption of responsibility
 */
export enum ReviewOwnership {
  // Assigned ownership
  MA_REVIEW = 'ma_review',                    // Medical Assistant - Administrative intake and routing
  FO_REVIEW = 'fo_review',                    // Front Office - Scheduling or insurance-related
  CLINICIAN_REVIEW_REQUIRED = 'clinician_review_required', // Licensed medical decision needed
  EXTERNAL_INFORMATION_ONLY = 'external_information_only', // No action required unless clinician decides otherwise
}

/**
 * Clinical Action State - What has or hasn't happened clinically
 * CRITICAL RISK CONTROL - This is where lawsuits are won or lost
 */
export enum ClinicalActionState {
  // No clinical action yet (YELLOW)
  NO_CLINICAL_ACTION_TAKEN = 'no_clinical_action_taken', // Default state
  CLINICAL_REVIEW_REQUIRED = 'clinical_review_required', // Pending licensed clinician assessment
  
  // Clinical actions taken (GREEN)
  REVIEWED_NO_CHANGE = 'reviewed_no_change', // Clinician reviewed; no change indicated
  REVIEWED_FOLLOW_UP_NEEDED = 'reviewed_follow_up_needed', // Further evaluation required
  REVIEWED_ACTION_COMPLETED = 'reviewed_action_completed', // Action completed in clinical system
}

/**
 * Medication-Specific Status (High-Risk Area)
 */
export enum MedicationStatus {
  MEDICATION_UPDATE_REPORTED = 'medication_update_reported', // Patient reports medication info
  EXTERNAL_MEDICATION_CHANGE_UNVERIFIED = 'external_medication_change_unverified', // Hospital/outside provider
  PENDING_MEDICATION_REVIEW = 'pending_medication_review', // Awaiting clinician confirmation
  MEDICATION_REVIEW_COMPLETED = 'medication_review_completed', // Reviewed by clinician
  MEDICATION_CHANGES_IMPLEMENTED = 'medication_changes_implemented', // Implemented in Solopractice
}

/**
 * Urgency Classification (Determines SLA Time Windows)
 * This is the primary classification that determines response time requirements
 */
export enum UrgencyLevel {
  EMERGENCY = 'emergency',     // RED: Chest pain, etc. - 15min response, max 30min
  URGENT = 'urgent',           // RED: Urgent symptoms - 15min response, max 30min
  NORMAL = 'normal',           // YELLOW: AI triaged as MA-facing - 24h to respond and close
  ROUTINE = 'routine',         // GREEN: All others - 72h to close out
}

/**
 * Urgency Flags (Non-Diagnostic)
 * Internal visual flags only - these are flags, not decisions
 */
export enum UrgencyFlag {
  NONE = 'none',
  TIME_SENSITIVE = 'time_sensitive', // 🟡 Requires timely review
  ESCALATION_RECOMMENDED = 'escalation_recommended', // 🔴 Symptoms/language suggest urgency
  EMERGENCY_REDIRECT_SENT = 'emergency_redirect_sent', // ⚠️ Patient instructed to seek emergency care
}

/**
 * Combined status for a submission/item
 */
export interface SubmissionStatus {
  processingStatus: ProcessingStatus;
  reviewOwnership: ReviewOwnership;
  clinicalActionState: ClinicalActionState;
  medicationStatus?: MedicationStatus; // For medication-related submissions
  urgencyLevel: UrgencyLevel; // PRIMARY: Determines SLA time windows
  urgencyFlag: UrgencyFlag; // Secondary: Non-diagnostic flags
  
  // Metadata
  submittedAt: Date;
  lastUpdatedAt: Date;
  assignedTo?: string; // User ID or role
  estimatedCompletionTime?: Date;
  
  // Solopractice integration
  solopracticeRecordId?: string; // Link to Solopractice record
  clinicalSystemAction?: string; // "See clinical system for details"
}

/**
 * Solopractice Color Mapping
 * RED = Urgent/Escalated/Error
 * YELLOW = In Progress/Pending
 * GREEN = Complete/Closed
 */
export type SolopracticeColor = 'RED' | 'YELLOW' | 'GREEN' | 'GRAY';

/**
 * Status label configuration
 */
export interface StatusLabelConfig {
  label: string;
  description: string;
  internalTooltip?: string; // Internal staff tooltip
  patientFacing?: string; // Patient-facing description (if different)
  color: 'blue' | 'yellow' | 'green' | 'red' | 'gray' | 'purple';
  icon: string;
  isTerminal: boolean;
  requiresAction: boolean;
}
