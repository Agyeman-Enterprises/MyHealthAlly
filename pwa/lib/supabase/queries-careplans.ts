/**
 * Care Plan queries for Supabase
 */

import { supabase } from './client';

export interface CarePlan {
  id: string;
  patient_id: string;
  title: string;
  status: string;
  start_date: string | null;
  created_at: string;
}

export async function getPatientCarePlans(patientId: string) {
  const { data, error } = await supabase
    .from('care_plans')
    .select('*, care_plan_sections(*, care_plan_items(*))')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CarePlan[];
}

