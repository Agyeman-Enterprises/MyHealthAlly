import { fetchAPI } from '@/lib/utils';

export interface BMIReading {
  id: string;
  bmi: number;
  weightKg: number;
  heightCm: number;
  timestamp: string;
}

export interface BMILatest {
  bmi: number;
  weightKg: number;
  heightCm: number;
  timestamp: string;
}

export async function getBMIHistory(): Promise<BMIReading[]> {
  return fetchAPI('/patients/me/bmi/history');
}

export async function getBMILatest(): Promise<BMILatest> {
  return fetchAPI('/patients/me/bmi/latest');
}

