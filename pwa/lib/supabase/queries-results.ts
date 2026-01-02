/**
 * Results queries for Supabase (Lab, Radiology, Referrals)
 */

import { supabase } from './client';

export interface LabResult {
  id: string;
  patient_id: string;
  solopractice_lab_id?: string | null;
  test_name: string;
  test_type?: string | null;
  result_date?: string | null;
  status: string;
  results?: Record<string, unknown> | null;
  doctor_note?: string | null;
  doctor_note_language?: string | null;
  attachment_url?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface RadiologyResult {
  id: string;
  patient_id: string;
  solopractice_radiology_id?: string | null;
  study_type?: string | null;
  study_name: string;
  body_part?: string | null;
  result_date?: string | null;
  status: string;
  findings?: string | null;
  impression?: string | null;
  recommendation?: string | null;
  attachment_url?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface ReferralResponse {
  id: string;
  patient_id: string;
  solopractice_referral_id?: string | null;
  specialty?: string | null;
  specialist_name?: string | null;
  specialist_clinic?: string | null;
  status: string;
  appointment_date?: string | null;
  appointment_time?: string | null;
  notes?: string | null;
  notes_language?: string | null;
  response_date?: string | null;
  created_at: string;
}

export async function getPatientLabResults(patientId: string) {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('result_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as LabResult[];
}

export async function getLabResult(labResultId: string) {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('id', labResultId)
    .single();

  if (error) throw error;
  return data as LabResult;
}

export async function getPatientRadiologyResults(patientId: string) {
  const { data, error } = await supabase
    .from('radiology_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('result_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as RadiologyResult[];
}

export async function getRadiologyResult(radiologyId: string) {
  const { data, error } = await supabase
    .from('radiology_results')
    .select('*')
    .eq('id', radiologyId)
    .single();

  if (error) throw error;
  return data as RadiologyResult;
}

export async function getPatientReferralResponses(patientId: string) {
  const { data, error } = await supabase
    .from('referral_responses')
    .select('*')
    .eq('patient_id', patientId)
    .order('response_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ReferralResponse[];
}

export async function getReferralResponse(referralId: string) {
  const { data, error } = await supabase
    .from('referral_responses')
    .select('*')
    .eq('id', referralId)
    .single();

  if (error) throw error;
  return data as ReferralResponse;
}

