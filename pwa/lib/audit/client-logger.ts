/**
 * Client-Side Audit Logger
 * Logs all patient interactions and system events for legal defense
 */

import { supabase } from '../supabase/client';

export type ActionType =
  | 'message_sent'
  | 'message_received'
  | 'message_deferred'
  | 'message_blocked'
  | 'refill_requested'
  | 'refill_approved'
  | 'refill_blocked'
  | 'vital_recorded'
  | 'appointment_requested'
  | 'emergency_redirect_shown'
  | 'disclaimer_acknowledged'
  | 'warning_ignored'
  | 'login'
  | 'logout'
  | 'export_requested'
  | 'data_deleted';

export type ResourceType =
  | 'message'
  | 'medication'
  | 'vital'
  | 'task'
  | 'appointment'
  | 'patient'
  | 'user';

export interface AuditLogEntry {
  action_type: ActionType;
  resource_type: ResourceType;
  resource_id?: string;
  details?: Record<string, any>;
  patient_id?: string;
}

export interface PatientInteractionLog {
  patient_id: string;
  interaction_type: string;
  practice_open: boolean;
  copy_shown: string;
  action_taken: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      patient_id: entry.patient_id || null,
      action_type: entry.action_type,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id || null,
      details: entry.details || {},
      // Note: IP address and user agent would be captured server-side
      // For client-side, we log what we can
    });

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break the app
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging should not break the app
  }
}

/**
 * Log a patient interaction (what was shown to patient)
 */
export async function logPatientInteraction(
  log: PatientInteractionLog
): Promise<void> {
  try {
    const { error } = await supabase.from('patient_interaction_logs').insert({
      patient_id: log.patient_id,
      interaction_type: log.interaction_type,
      practice_open: log.practice_open,
      copy_shown: log.copy_shown,
      action_taken: log.action_taken,
      reason: log.reason || null,
      metadata: log.metadata || {},
    });

    if (error) {
      console.error('Failed to log patient interaction:', error);
      // Don't throw - audit logging should not break the app
    }
  } catch (error) {
    console.error('Error logging patient interaction:', error);
    // Don't throw - audit logging should not break the app
  }
}

/**
 * Log message sent
 */
export async function logMessageSent(
  messageId: string,
  threadId: string,
  patientId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action_type: 'message_sent',
    resource_type: 'message',
    resource_id: messageId,
    patient_id: patientId,
    details: {
      thread_id: threadId,
      ...details,
    },
  });
}

/**
 * Log message deferred (after hours)
 */
export async function logMessageDeferred(
  threadId: string,
  patientId: string,
  nextOpenAt: string
): Promise<void> {
  await logAuditEvent({
    action_type: 'message_deferred',
    resource_type: 'message',
    resource_id: threadId,
    patient_id: patientId,
    details: {
      next_open_at: nextOpenAt,
    },
  });

  await logPatientInteraction({
    patient_id: patientId,
    interaction_type: 'message',
    practice_open: false,
    copy_shown: `Message received after hours. Will be reviewed at ${nextOpenAt}.`,
    action_taken: 'deferred',
    reason: 'After hours',
    metadata: {
      thread_id: threadId,
      next_open_at: nextOpenAt,
    },
  });
}

/**
 * Log emergency redirect shown
 */
export async function logEmergencyRedirect(
  patientId: string,
  reason: string,
  symptoms?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action_type: 'emergency_redirect_shown',
    resource_type: 'patient',
    patient_id: patientId,
    details: {
      reason,
      symptoms,
    },
  });

  await logPatientInteraction({
    patient_id: patientId,
    interaction_type: 'message',
    practice_open: false,
    copy_shown: 'Based on your symptoms, this appears to be a medical emergency. Please call 911 immediately.',
    action_taken: 'redirected',
    reason,
    metadata: {
      symptoms,
    },
  });
}

/**
 * Log disclaimer acknowledgment
 */
export async function logDisclaimerAcknowledged(
  patientId: string,
  disclaimerType: string,
  page: string
): Promise<void> {
  await logAuditEvent({
    action_type: 'disclaimer_acknowledged',
    resource_type: 'patient',
    patient_id: patientId,
    details: {
      disclaimer_type: disclaimerType,
      page,
    },
  });
}

/**
 * Log warning ignored
 */
export async function logWarningIgnored(
  patientId: string,
  warningType: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action_type: 'warning_ignored',
    resource_type: 'patient',
    patient_id: patientId,
    details: {
      warning_type: warningType,
      ...details,
    },
  });
}

