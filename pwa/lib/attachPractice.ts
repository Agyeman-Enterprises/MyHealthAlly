/**
 * Practice Attachment Utility
 * 
 * ⚠️ MANDATORY: This is the ONLY place allowed to:
 * - Set practice_id
 * - Set attachment_status = 'ATTACHED'
 * - Create SP patient
 * - Store sp_patient_id
 * 
 * All SP patient creation logic MUST live here.
 */

import { supabase } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api/solopractice-client';
import type { Patient } from '@/lib/supabase/types';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export type AttachPracticeInput = {
  user: User;
  patient: Patient;
  practiceId: string;
  practiceName?: string;
  // required: user explicitly consented to attach to this practice
  consentAccepted: boolean;
  // optional metadata for auditing/ops
  source?: 'OHIMAA' | 'MEDRX' | 'BOOKADOC2U' | 'REGISTERED' | 'INVITE' | 'OTHER';
};

export type AttachPracticeResult = {
  practiceId: string;
  spPatientId: string | null;
  attachmentStatus: 'ATTACHED';
};

function assertTruthy(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/**
 * attachPractice()
 * - Idempotent: if already attached to same practice, returns current values.
 * - ONLY place allowed to create an SP patient ID.
 */
export async function attachPractice(input: AttachPracticeInput): Promise<AttachPracticeResult> {
  const { user, patient, practiceId, consentAccepted } = input;
  assertTruthy(user?.id, 'Missing user.id');
  assertTruthy(patient?.id, 'Missing patient.id');
  assertTruthy(consentAccepted === true, 'Consent must be accepted before attaching practice');
  assertTruthy(practiceId, 'Missing practiceId');

  // Resolve practice ID: If practiceId is a UUID (from practices table), get the practice_id string
  // Otherwise, use practiceId as-is (for predefined practices or custom)
  let resolvedPracticeId = practiceId;
  
  // Check if practiceId is a UUID (from practices table)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(practiceId)) {
    // It's a UUID, look up the practice to get the practice_id string
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('practice_id, status, is_public')
      .eq('id', practiceId)
      .single();
    
    if (practiceError || !practice) {
      // UUID not found in practices table - might be invalid or deleted
      throw new Error('Practice not found. Please select a different practice or contact support.');
    }
    
    // Verify practice is approved and public
    if (practice.status !== 'approved') {
      throw new Error('This practice is not yet approved. Please wait for approval or contact support.');
    }
    
    if (!practice.is_public) {
      throw new Error('This practice is not available for public selection.');
    }
    
    resolvedPracticeId = practice.practice_id;
  }

  // If already attached to same practice and has sp_patient_id, no-op
  if (
    patient.attachment_status === 'ATTACHED' &&
    patient.practice_id === resolvedPracticeId &&
    patient.sp_patient_id
  ) {
    return {
      practiceId: resolvedPracticeId,
      spPatientId: patient.sp_patient_id,
      attachmentStatus: 'ATTACHED',
    };
  }

  // 1) Update patient attachment in DB first (authoritative)
  // Note: practice_id in patients table stores the practice_id string (not UUID)
  const { data: updated, error: updateErr } = await supabase
    .from('patients')
    .update({
      practice_id: resolvedPracticeId, // Store the practice_id string
      attachment_status: 'ATTACHED',
      attached_at: new Date().toISOString(),
      attachment_requested_at: null,
    })
    .eq('id', patient.id)
    .select('id, practice_id, attachment_status, sp_patient_id')
    .single();

  if (updateErr) throw updateErr;
  assertTruthy(updated, 'Failed to update patient attachment');

  // 2) Explicitly create/register patient in SP if missing
  // If your SP backend doesn't have this endpoint yet, implement it.
  let spPatientId: string | null = updated.sp_patient_id ?? null;

  if (!spPatientId) {
    // IMPORTANT: this must be an explicit call (no implicit creation on message/vitals)
    // Implement createOrGetPatient in solopracticeClient (see below).
    const created = await apiClient.createOrGetPatient({
      tenantPracticeId: resolvedPracticeId, // Use resolved practice ID
      mhaUserId: user.id,
      mhaPatientId: patient.id,
      firstName: patient.first_name ?? '',
      lastName: patient.last_name ?? '',
      dateOfBirth: patient.date_of_birth ?? null,
      phone: (patient.address && typeof patient.address === 'object' && 'phone' in patient.address && typeof patient.address.phone === 'string' ? patient.address.phone : null),
      email: user.email ?? null,
    });

    spPatientId = created.spPatientId;
    assertTruthy(spPatientId, 'SP patient creation returned no spPatientId');

    // 3) Persist sp_patient_id back to MHA DB
    const { error: spUpdateErr } = await supabase
      .from('patients')
      .update({ sp_patient_id: spPatientId })
      .eq('id', patient.id);

    if (spUpdateErr) throw spUpdateErr;
  }

  return {
    practiceId: resolvedPracticeId,
    spPatientId,
    attachmentStatus: 'ATTACHED',
  };
}
