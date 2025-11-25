import { fetchAPI } from '@/lib/utils';
import type { IntentType } from '@/services/ai/intent-classifier';

export type TriageSeverity = 'ROUTINE' | 'URGENT' | 'EMERGENT' | 'UNKNOWN';
export type TriageStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TriageTask {
  id: string;
  patientId: string;
  patientName?: string;
  createdAt: string;
  createdBy: string; // 'SYSTEM' | 'AI' | 'PATIENT' | userId
  intentType: IntentType;
  severity: TriageSeverity;
  status: TriageStatus;
  assigneeRole?: 'MA' | 'CLINICIAN';
  supervisingClinicianId: string;
  assignedMAId?: string;
  sourceMessageId?: string;
  sourceCheckInId?: string;
  sourceType?: 'voice' | 'text' | 'check-in';
  sourceMessage?: string;
  notes?: string;
  symptomId?: string;
  refillId?: string;
  appointmentId?: string;
  adminTaskId?: string;
  // Audit & Sign-off fields
  openedAt: string;
  firstActionAt?: string;
  lastActionAt?: string;
  closedAt?: string;
  handledByUserId?: string;
  handledByRole?: 'MA' | 'CLINICIAN';
  actionNote?: string;
  isOverdue: boolean;
}

export interface TriageTaskLog {
  id: string;
  taskId: string;
  timestamp: string;
  actorId: string;
  actorRole: 'PATIENT' | 'MA' | 'CLINICIAN' | 'SYSTEM';
  actionType:
    | 'CREATED'
    | 'UPDATED_PRIORITY'
    | 'APPOINTMENT_BOOKED'
    | 'CLOSED'
    | 'COMMENT_ADDED'
    | 'REASSIGNED'
    | 'SEVERITY_CHANGED'
    | 'MARKED_OVERDUE'
    | 'FIRST_ACTION'
    | 'NOTE_ADDED';
  details?: string | Record<string, any>;
}

export async function createTriageTask(data: {
  intentType: IntentType;
  severity?: TriageSeverity;
  sourceMessage?: string;
  sourceType?: 'voice' | 'text' | 'check-in';
  symptomId?: string;
  refillId?: string;
  appointmentId?: string;
  adminTaskId?: string;
  preferredDate?: string;
  preferredTime?: string;
}): Promise<TriageTask> {
  return fetchAPI('/triage/tasks', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      severity: data.severity || 'ROUTINE',
    }),
  });
}

export async function getTriageTasks(filters?: {
  status?: TriageStatus;
  severity?: TriageSeverity;
  intentType?: IntentType;
  patientId?: string;
}): Promise<TriageTask[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.intentType) params.append('intentType', filters.intentType);
  if (filters?.patientId) params.append('patientId', filters.patientId);

  const query = params.toString();
  return fetchAPI(`/triage/tasks${query ? `?${query}` : ''}`);
}

export async function updateTriageTask(
  taskId: string,
  updates: {
    status?: TriageStatus;
    severity?: TriageSeverity;
    notes?: string;
    assignedMAId?: string;
    actionNote?: string;
    handledByUserId?: string;
    handledByRole?: 'MA' | 'CLINICIAN';
  }
): Promise<TriageTask> {
  return fetchAPI(`/triage/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function closeTriageTask(
  taskId: string,
  data: {
    actionNote: string;
    handledByUserId: string;
    handledByRole: 'MA' | 'CLINICIAN';
  }
): Promise<TriageTask> {
  if (!data.actionNote || data.actionNote.trim().length < 3) {
    throw new Error('Action note is required (minimum 3 characters)');
  }
  if (!data.handledByUserId) {
    throw new Error('Handler user ID is required');
  }

  return fetchAPI(`/triage/tasks/${taskId}/close`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markOverdueTasks(): Promise<{ count: number; tasks: TriageTask[] }> {
  return fetchAPI('/triage/tasks/mark-overdue', {
    method: 'POST',
  });
}

export async function getTriageTaskLogs(taskId: string): Promise<TriageTaskLog[]> {
  return fetchAPI(`/triage/tasks/${taskId}/logs`);
}

export async function addTriageTaskLog(
  taskId: string,
  log: {
    actionType: TriageTaskLog['actionType'];
    details?: string;
  }
): Promise<TriageTaskLog> {
  return fetchAPI(`/triage/tasks/${taskId}/logs`, {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

