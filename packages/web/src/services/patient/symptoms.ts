import { fetchAPI } from '@/lib/utils';

export interface SymptomReport {
  id: string;
  description: string;
  symptomType: string;
  severity: 'mild' | 'moderate' | 'severe';
  reportedAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export async function createSymptomReport(data: {
  description: string;
  symptomType?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  reportedAt?: string;
}): Promise<SymptomReport> {
  return fetchAPI('/patients/me/symptoms', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      reportedAt: data.reportedAt || new Date().toISOString(),
    }),
  });
}

export async function getSymptomReports(): Promise<SymptomReport[]> {
  return fetchAPI('/patients/me/symptoms');
}

