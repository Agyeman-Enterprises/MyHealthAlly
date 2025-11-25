import { fetchAPI } from '@/lib/utils';

export interface ChartSummary {
  demographics: {
    name: string;
    dob: string;
    age: number;
    sex: string;
    mrn?: string;
    primaryClinician?: string;
  };
  activeProblems: Array<{
    id: string;
    diagnosis: string;
    icd10?: string;
    onsetDate?: string;
    status: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate?: string;
  }>;
  allergies: Array<{
    id: string;
    allergen: string;
    reaction?: string;
    severity?: string;
  }>;
  keyVitals: {
    bloodPressure?: string;
    heartRate?: number;
    bmi?: number;
    lastUpdated?: string;
  };
}

export interface TimelineEntry {
  id: string;
  date: string;
  type: 'Telehealth' | 'Clinic' | 'Urgent' | 'Follow-up' | 'Consult';
  encounterId?: string;
  noteSummary?: string;
  provider?: string;
}

export interface ChartNote {
  id: string;
  encounterId?: string;
  type: 'SOAP' | 'H&P' | 'Consult' | 'Discharge' | 'Progress' | 'Symptom Note';
  title: string;
  date: string;
  author: string;
  preview: string;
  content?: string;
  source?: 'voice' | 'text' | 'check-in';
  // Multilingual fields
  noteOriginalText?: string;
  noteOriginalLanguage?: string;
  noteCanonicalText?: string;
  noteLanguageForDisplay?: string;
}

export async function getChartSummary(patientId: string): Promise<ChartSummary> {
  return fetchAPI(`/clinician/patients/${patientId}/chart/summary`);
}

export async function getChartTimeline(patientId: string): Promise<TimelineEntry[]> {
  return fetchAPI(`/clinician/patients/${patientId}/chart/timeline`);
}

export async function getChartNotes(patientId: string, encounterId?: string): Promise<ChartNote[]> {
  const url = encounterId 
    ? `/clinician/patients/${patientId}/chart/notes?encounterId=${encounterId}`
    : `/clinician/patients/${patientId}/chart/notes`;
  return fetchAPI(url);
}

export async function getChartLabs(patientId: string): Promise<any[]> {
  return fetchAPI(`/clinician/patients/${patientId}/chart/labs`);
}

export async function getChartDocuments(patientId: string): Promise<any[]> {
  return fetchAPI(`/clinician/patients/${patientId}/chart/documents`);
}

export async function getChartReferrals(patientId: string): Promise<any[]> {
  return fetchAPI(`/clinician/patients/${patientId}/chart/referrals`);
}

export async function createNote(patientId: string, note: {
  encounterId?: string;
  type: string;
  title: string;
  content: string;
}): Promise<ChartNote> {
  return fetchAPI(`/clinician/patients/${patientId}/chart/notes`, {
    method: 'POST',
    body: JSON.stringify(note),
  });
}

