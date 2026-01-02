/**
 * Medication queries for Supabase
 */

import { supabase } from './client';

export interface Medication {
  id: string;
  patient_id: string;
  prescriber_id?: string | null;
  name: string;
  generic_name?: string | null;
  brand_name?: string | null;
  ndc_code?: string | null;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  route?: string | null;
  schedule?: Record<string, unknown> | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  is_prn: boolean;
  refills_remaining?: number | null;
  last_refill_date?: string | null;
  pharmacy?: string | null;
  pharmacy_phone?: string | null;
  instructions?: string | null;
  instructions_language?: string | null;
  indication?: string | null;
  discontinued_at?: string | null;
  discontinued_reason?: string | null;
  days_supply?: number | null;
  next_refill_due_date?: string | null;
  solopractice_medication_id?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPatientMedications(patientId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*, clinicians(first_name, last_name)')
    .eq('patient_id', patientId)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Medication & { clinicians: { first_name: string; last_name: string } | null })[];
}

export async function getRefillRequests(options?: {
  patientId?: string;
  status?: string;
  limit?: number;
}) {
  let query = supabase
    .from('refill_requests')
    .select('*, medications(name, dosage), patients(first_name, last_name)')
    .order('requested_at', { ascending: false });

  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId);
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

