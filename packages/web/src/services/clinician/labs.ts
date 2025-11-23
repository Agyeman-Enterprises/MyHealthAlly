import { fetchAPI } from '@/lib/utils';

export interface LabOrderRequest {
  patientId: string;
  testName: string;
  testCode?: string;
  notes?: string;
  priority?: 'routine' | 'urgent';
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName?: string;
  testName: string;
  testCode?: string;
  status: string;
  orderedAt: string;
  orderedBy?: string;
  notes?: string;
  priority?: string;
  results?: any;
}

export async function createLabOrder(order: LabOrderRequest): Promise<LabOrder> {
  return fetchAPI('/clinician/labs/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function getLabOrders(filters?: {
  patientId?: string;
  status?: string;
  testName?: string;
}): Promise<LabOrder[]> {
  const params = new URLSearchParams();
  if (filters?.patientId) params.append('patientId', filters.patientId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.testName) params.append('testName', filters.testName);
  
  const query = params.toString();
  return fetchAPI(`/clinician/labs/orders${query ? `?${query}` : ''}`);
}

export async function updateLabOrderStatus(orderId: string, status: string): Promise<LabOrder> {
  return fetchAPI(`/clinician/labs/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

