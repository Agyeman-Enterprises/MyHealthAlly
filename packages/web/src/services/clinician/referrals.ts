import { fetchAPI } from '@/lib/utils';

export interface ReferralRequest {
  patientId: string;
  specialty: string;
  reason: string;
  priority?: 'routine' | 'urgent';
  notes?: string;
  referringProviderId?: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName?: string;
  specialty: string;
  reason: string;
  priority: string;
  status: string;
  notes?: string;
  createdAt: string;
  referringProviderId?: string;
  referringProviderName?: string;
}

export async function createReferral(referral: ReferralRequest): Promise<Referral> {
  return fetchAPI('/clinician/referrals', {
    method: 'POST',
    body: JSON.stringify(referral),
  });
}

export async function getReferrals(filters?: {
  patientId?: string;
  status?: string;
  specialty?: string;
}): Promise<Referral[]> {
  const params = new URLSearchParams();
  if (filters?.patientId) params.append('patientId', filters.patientId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.specialty) params.append('specialty', filters.specialty);
  
  const query = params.toString();
  return fetchAPI(`/clinician/referrals${query ? `?${query}` : ''}`);
}

export async function updateReferralStatus(referralId: string, status: string): Promise<Referral> {
  return fetchAPI(`/clinician/referrals/${referralId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

