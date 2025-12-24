/**
 * Supabase query utilities for provider/clinician routes
 * These functions wrap Supabase queries with proper typing and error handling
 */

import { supabase } from './client';
import type { Database, Patient, Message, MessageThread, Task, Alert, Vital } from './types';

// ============================================
// PATIENTS
// ============================================

export async function getPatients(options?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('patients')
    .select('*, users(email, phone)')
    .order('created_at', { ascending: false });

  if (options?.search) {
    query = query.or(
      `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,medical_record_number.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as (Patient & { users: { email: string; phone: string | null } })[];
}

export async function getPatient(patientId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*, users(email, phone), clinicians(*)')
    .eq('id', patientId)
    .single();

  if (error) throw error;
  return data as Patient & {
    users: { email: string; phone: string | null };
    clinicians: any;
  };
}

// ============================================
// MESSAGES
// ============================================

export async function getMessageThreads(options?: {
  patientId?: string;
  status?: string;
  priority?: string;
  limit?: number;
}) {
  let query = supabase
    .from('message_threads')
    .select('*, patients(first_name, last_name, preferred_name)')
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId);
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.priority && options.priority !== 'all') {
    query = query.eq('priority', options.priority);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as (MessageThread & {
    patients: { first_name: string; last_name: string; preferred_name: string | null };
  })[];
}

export async function getMessages(threadId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, users(email)')
    .eq('thread_id', threadId)
    .order('sent_at', { ascending: true });

  if (error) throw error;
  return data as (Message & { users: { email: string } })[];
}

export async function getMessage(messageId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, message_threads(*, patients(*))')
    .eq('id', messageId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMessageStatus(messageId: string, status: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: status === 'read' ? new Date().toISOString() : null })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// TASKS / WORK ITEMS
// ============================================

export async function getTasks(options?: {
  assigneeUserId?: string;
  patientId?: string;
  status?: string;
  priority?: string;
  category?: string;
  limit?: number;
}) {
  let query = supabase
    .from('tasks')
    .select('*, patients(first_name, last_name, preferred_name), users(email)')
    .order('created_at', { ascending: false });

  if (options?.assigneeUserId) {
    query = query.eq('assignee_user_id', options.assigneeUserId);
  }

  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId);
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.priority && options.priority !== 'all') {
    query = query.eq('priority', options.priority);
  }

  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as (Task & {
    patients: { first_name: string; last_name: string; preferred_name: string | null } | null;
    users: { email: string };
  })[];
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

// ============================================
// VITALS
// ============================================

export async function getPatientVitals(patientId: string, options?: { limit?: number }) {
  let query = supabase
    .from('vitals')
    .select('*')
    .eq('patient_id', patientId)
    .order('measured_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Vital[];
}

// ============================================
// ALERTS
// ============================================

export async function getAlerts(options?: {
  patientId?: string;
  status?: string;
  severity?: string;
  limit?: number;
}) {
  let query = supabase
    .from('alerts')
    .select('*, patients(first_name, last_name)')
    .order('created_at', { ascending: false });

  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId);
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.severity && options.severity !== 'all') {
    query = query.eq('severity', options.severity);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as (Alert & {
    patients: { first_name: string; last_name: string };
  })[];
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(clinicianId?: string) {
  // Get message counts
  const { data: messages, error: messagesError } = await supabase
    .from('message_threads')
    .select('status, priority, clinician_unread_count');

  if (messagesError) throw messagesError;

  // Get task counts
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('status, priority, category, due_at');

  if (tasksError) throw tasksError;

  // Get patient counts
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, created_at');

  if (patientsError) throw patientsError;

  // Calculate stats
  const messageStats = {
    total: messages?.length || 0,
    new: messages?.filter((m) => m.status === 'open' && m.clinician_unread_count > 0).length || 0,
    in_progress: messages?.filter((m) => m.status === 'in_progress').length || 0,
    overdue: 0, // Calculate based on due dates if available
    by_urgency: {
      red: messages?.filter((m) => m.priority === 'urgent').length || 0,
      yellow: messages?.filter((m) => m.priority === 'normal').length || 0,
      green: messages?.filter((m) => m.priority === 'normal').length || 0,
    },
  };

  const taskStats = {
    total: tasks?.length || 0,
    new: tasks?.filter((t) => t.status === 'pending').length || 0,
    in_progress: tasks?.filter((t) => t.status === 'in_progress').length || 0,
    overdue: tasks?.filter((t) => t.due_at && new Date(t.due_at) < new Date() && t.status !== 'completed').length || 0,
    by_type: {
      message: tasks?.filter((t) => t.category === 'patient_outreach').length || 0,
      refill: tasks?.filter((t) => t.category === 'medication').length || 0,
      vital_alert: tasks?.filter((t) => t.category === 'vital_check').length || 0,
      appointment: tasks?.filter((t) => t.category === 'appointment').length || 0,
    },
  };

  const patientStats = {
    total: patients?.length || 0,
    active: patients?.length || 0, // TODO: Define active criteria
    new_this_month: patients?.filter((p) => {
      const created = new Date(p.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  const slaStats = {
    on_time: 95, // TODO: Calculate actual SLA
    at_risk: 3,
    overdue: 2,
  };

  return {
    messages: messageStats,
    work_items: taskStats,
    patients: patientStats,
    sla: slaStats,
  };
}

