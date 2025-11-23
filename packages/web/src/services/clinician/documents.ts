import { fetchAPI } from '@/lib/utils';

export interface ExcuseNoteRequest {
  patientId: string;
  type: 'work' | 'school' | 'other';
  startDate: string;
  endDate?: string;
  reason: string;
  restrictions?: string;
  notes?: string;
}

export interface ExcuseNote {
  id: string;
  patientId: string;
  patientName?: string;
  type: string;
  startDate: string;
  endDate?: string;
  reason: string;
  restrictions?: string;
  status: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export async function createExcuseNote(note: ExcuseNoteRequest): Promise<ExcuseNote> {
  return fetchAPI('/clinician/documents/excuse-notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
}

export async function getExcuseNotes(filters?: {
  patientId?: string;
  status?: string;
  type?: string;
}): Promise<ExcuseNote[]> {
  const params = new URLSearchParams();
  if (filters?.patientId) params.append('patientId', filters.patientId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  
  const query = params.toString();
  return fetchAPI(`/clinician/documents/excuse-notes${query ? `?${query}` : ''}`);
}

export async function updateExcuseNoteStatus(noteId: string, status: string): Promise<ExcuseNote> {
  return fetchAPI(`/clinician/documents/excuse-notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

