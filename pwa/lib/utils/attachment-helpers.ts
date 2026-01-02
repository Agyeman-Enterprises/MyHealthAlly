/**
 * Practice Attachment Helpers
 * 
 * Utility functions for checking attachment status
 */

import type { Patient, AttachmentStatus } from '@/lib/supabase/types';

/**
 * Check if patient is clinically attached to a practice
 * Only ATTACHED status allows clinical actions
 */
export function isClinicallyAttached(patient: Patient | null | undefined): boolean {
  if (!patient) return false;
  return patient.attachment_status === 'ATTACHED' && !!patient.practice_id;
}

/**
 * Check if patient has requested attachment
 */
export function isAttachmentRequested(patient: Patient | null | undefined): boolean {
  if (!patient) return false;
  return patient.attachment_status === 'REQUESTED';
}

/**
 * Check if patient is unattached
 */
export function isUnattached(patient: Patient | null | undefined): boolean {
  if (!patient) return true;
  return patient.attachment_status === 'UNATTACHED' || !patient.practice_id;
}

/**
 * Get attachment status display text
 */
export function getAttachmentStatusText(status: AttachmentStatus): string {
  switch (status) {
    case 'UNATTACHED':
      return 'Not connected to a care team';
    case 'REQUESTED':
      return 'Connection request pending';
    case 'ATTACHED':
      return 'Connected to care team';
    default:
      return 'Unknown status';
  }
}

