import { supabase } from './client';

export type TriageLevel = 'routine' | 'urgent' | 'emergent';

export interface SymptomCheckPayload {
  patientId: string;
  disclaimerAckAt: string | null;
  chiefComplaintText: string;
  category: string | null;
  redFlagsSelected: string[];
  triageLevel: TriageLevel;
  answers: Array<{ question: string; answer: string }>;
  summaryPatientSafe: string;
  summaryClinician: string;
  education: string[];
}

export async function createSymptomCheckWithTask(payload: SymptomCheckPayload) {
  // Resolve patient owner for task assignment fallback
  let patientUserId: string | null = null;
  let authUserId: string | null = null;
  try {
    const { data: patientRow } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', payload.patientId)
      .single();
    patientUserId = patientRow?.user_id || null;
  } catch {
    patientUserId = null;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    authUserId = user?.id || null;
  } catch {
    authUserId = null;
  }
  if (!patientUserId && !authUserId) {
    throw new Error('Unable to resolve assignee for review task.');
  }

  const { data: symptom, error: symptomError } = await supabase
    .from('symptom_checks')
    .insert({
      patient_id: payload.patientId,
      disclaimer_ack_at: payload.disclaimerAckAt,
      chief_complaint_text: payload.chiefComplaintText,
      category: payload.category,
      red_flags_selected: payload.redFlagsSelected,
      triage_level: payload.triageLevel,
      answers: payload.answers,
      summary_patient_safe: payload.summaryPatientSafe,
      summary_clinician: payload.summaryClinician,
      education_patient_general: payload.education,
      status: 'submitted',
    })
    .select('id')
    .single();

  if (symptomError) throw symptomError;

  const priority =
    payload.triageLevel === 'emergent'
      ? 'urgent'
      : payload.triageLevel === 'urgent'
      ? 'high'
      : 'medium';

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      assignee_user_id: patientUserId || authUserId,
      assignee_role: 'patient',
      created_by_user_id: authUserId,
      patient_id: payload.patientId,
      title: 'Symptom check review',
      description: 'AI-assisted symptom intake submitted. Review required.',
      category: 'symptom_check_review',
      priority,
      status: 'pending',
    })
    .select('id')
    .single();

  if (taskError) throw taskError;

  const { error: updateError } = await supabase
    .from('symptom_checks')
    .update({ handoff_task_id: task.id })
    .eq('id', symptom.id);

  if (updateError) throw updateError;

  return { symptomCheckId: symptom.id, taskId: task.id };
}
