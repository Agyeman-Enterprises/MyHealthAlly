/**
 * Medication queries for Supabase
 */

import { supabase } from './client';

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPatientMedications(patientId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*, clinicians(first_name, last_name)')
    .eq('patient_id', patientId)
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

