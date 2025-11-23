import { fetchAPI } from '@/lib/utils';

export interface CheckinData {
  mood?: number;
  sleepHours?: number;
  stressLevel?: number;
  symptoms?: string[];
  notes?: string;
  timestamp?: string;
}

export async function submitCheckin(data: CheckinData): Promise<void> {
  await fetchAPI('/patients/me/checkins', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    }),
  });
}

