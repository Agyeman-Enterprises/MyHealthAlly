import { fetchAPI } from '@/lib/utils';

export interface RefillRequest {
  id: string;
  medicationName?: string;
  medicationId?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'denied' | 'filled';
  requestedAt: string;
  filledAt?: string;
}

export async function createRefillRequest(data: {
  medicationName?: string;
  medicationId?: string;
  notes?: string;
}): Promise<RefillRequest> {
  return fetchAPI('/patients/me/refills/create', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
    }),
  });
}

export async function getRefillRequests(): Promise<RefillRequest[]> {
  return fetchAPI('/patients/me/refills');
}

