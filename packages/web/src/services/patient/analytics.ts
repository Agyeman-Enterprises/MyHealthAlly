import { fetchAPI } from '@/lib/utils';

export type AnalyticsData = {
  recoveryScore: number;
  stressLevel: 'low' | 'moderate' | 'high';
  latestVitals: {
    heartRate?: number;
    spo2?: number;
    respiration?: number;
    systolicBP?: number;
    diastolicBP?: number;
  } | null;
  hrvTrend: Array<{
    timestamp: string;
    rmssdMs: number;
  }>;
  bmi: {
    weightKg: number;
    heightCm: number;
    bmi: number;
    timestamp: string;
  } | null;
};

export async function getPatientAnalytics(): Promise<AnalyticsData> {
  try {
    const data = await fetchAPI('/patients/analytics');
    return data;
  } catch (error) {
    console.error('Error fetching patient analytics:', error);
    return {
      recoveryScore: 0,
      stressLevel: 'moderate',
      latestVitals: null,
      hrvTrend: [],
      bmi: null,
    };
  }
}

