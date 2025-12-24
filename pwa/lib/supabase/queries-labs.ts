/**
 * Lab queries for Supabase
 */

import { supabase } from './client';

export interface LabOrder {
  id: string;
  patient_id: string;
  order_number: string | null;
  status: string;
  ordered_at: string;
  collection_date: string | null;
  resulted_at: string | null;
  created_at: string;
}

export async function getPatientLabOrders(patientId: string, options?: { limit?: number }) {
  let query = supabase
    .from('lab_orders')
    .select('*, lab_tests(*), clinicians(first_name, last_name)')
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as (LabOrder & {
    lab_tests: any[];
    clinicians: { first_name: string; last_name: string } | null;
  })[];
}

