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
  // Get message counts with last_message_at and patient_id for SLA calculations
  const { data: messages, error: messagesError } = await supabase
    .from('message_threads')
    .select('status, priority, clinician_unread_count, last_message_at, patient_id');

  if (messagesError) throw messagesError;

  // Get task counts
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('status, priority, category, due_at, patient_id, created_at');

  if (tasksError) throw tasksError;

  // Get patient counts
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, created_at');

  if (patientsError) throw patientsError;

  // Get recent vitals for active patient calculation
  const { data: vitals, error: vitalsError } = await supabase
    .from('vitals')
    .select('patient_id, measured_at')
    .order('measured_at', { ascending: false })
    .limit(1000);

  if (vitalsError) throw vitalsError;

  // Calculate stats
  // Calculate overdue messages based on last_message_at and SLA rules
  const now = new Date();
  const overdueMessages = messages?.filter((m) => {
    if (!m.last_message_at || m.status === 'closed') return false;
    const lastMessageDate = new Date(m.last_message_at);
    const hoursSinceLastMessage = (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60);
    
    // Simple SLA: urgent > 4 hours, normal > 24 hours
    if (m.priority === 'urgent' && hoursSinceLastMessage > 4) return true;
    if (m.priority === 'normal' && hoursSinceLastMessage > 24) return true;
    return false;
  }).length || 0;

  const messageStats = {
    total: messages?.length || 0,
    new: messages?.filter((m) => m.status === 'open' && m.clinician_unread_count > 0).length || 0,
    in_progress: messages?.filter((m) => m.status === 'in_progress').length || 0,
    overdue: overdueMessages,
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

  // Active patients: have activity in last 30 days (messages, vitals, or tasks)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activePatients = patients?.filter((p) => {
    // Check if patient has recent activity
    const hasRecentMessages = messages?.some((m) => 
      m.patient_id === p.id && m.last_message_at && new Date(m.last_message_at) > thirtyDaysAgo
    );
    const hasRecentVitals = vitals?.some((v) => 
      v.patient_id === p.id && new Date(v.measured_at) > thirtyDaysAgo
    );
    const hasRecentTasks = tasks?.some((t) => 
      t.patient_id === p.id && t.created_at && new Date(t.created_at) > thirtyDaysAgo
    );
    return hasRecentMessages || hasRecentVitals || hasRecentTasks;
  }).length || 0;

  const patientStats = {
    total: patients?.length || 0,
    active: activePatients,
    new_this_month: patients?.filter((p) => {
      const created = new Date(p.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  // Calculate actual SLA metrics
  const totalItems = (messages?.length || 0) + (tasks?.length || 0);
  const overdueItems = overdueMessages + (tasks?.filter((t) => 
    t.due_at && new Date(t.due_at) < now && t.status !== 'completed'
  ).length || 0);
  
  // At risk: items due within next 2 hours
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const atRiskItems = tasks?.filter((t) => 
    t.due_at && 
    new Date(t.due_at) > now && 
    new Date(t.due_at) <= twoHoursFromNow &&
    t.status !== 'completed'
  ).length || 0;

  const onTimePercentage = totalItems > 0 
    ? Math.round(((totalItems - overdueItems) / totalItems) * 100)
    : 100;

  const slaStats = {
    on_time: onTimePercentage,
    at_risk: atRiskItems,
    overdue: overdueItems,
  };

  return {
    messages: messageStats,
    work_items: taskStats,
    patients: patientStats,
    sla: slaStats,
  };
}

