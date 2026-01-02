// lib/server/assertAttachedPatient.ts
import { getCurrentUserAndPatient } from "@/lib/supabase/queries-settings";
import { supabaseService } from "@/lib/supabase/service";

export type AttachedPatientContext = {
  patientId: string;
  practiceId: string;
  spPatientId: string;
};

/**
 * Assert that the currently authenticated user's patient is attached.
 * Use this for user-initiated API routes.
 */
export async function assertAttachedPatient(): Promise<AttachedPatientContext> {
  const { patient } = await getCurrentUserAndPatient();

  if (!patient) {
    throw new Error("No patient record found");
  }

  if (patient.attachment_status !== "ATTACHED") {
    throw new Error("Patient is not attached to a practice");
  }

  if (!patient.practice_id) {
    throw new Error("Patient has no practice_id");
  }

  if (!patient.sp_patient_id) {
    throw new Error("Patient has no sp_patient_id");
  }

  return {
    patientId: patient.id,
    practiceId: patient.practice_id,
    spPatientId: patient.sp_patient_id,
  };
}

/**
 * Assert that a specific patient (by ID) is attached.
 * Use this for webhook routes that receive patient_id in the payload.
 */
export async function assertPatientAttached(patientId: string): Promise<AttachedPatientContext> {
  if (!supabaseService) {
    throw new Error("Database service not available");
  }

  const { data: patient, error } = await supabaseService
    .from("patients")
    .select("id, attachment_status, practice_id, sp_patient_id")
    .eq("id", patientId)
    .single();

  if (error || !patient) {
    throw new Error("Patient not found");
  }

  if (patient.attachment_status !== "ATTACHED") {
    throw new Error("Patient is not attached to a practice");
  }

  if (!patient.practice_id) {
    throw new Error("Patient has no practice_id");
  }

  if (!patient.sp_patient_id) {
    throw new Error("Patient has no sp_patient_id");
  }

  return {
    patientId: patient.id,
    practiceId: patient.practice_id,
    spPatientId: patient.sp_patient_id,
  };
}

