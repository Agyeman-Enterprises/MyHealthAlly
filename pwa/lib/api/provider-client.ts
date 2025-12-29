/**
 * Provider API Client
 * 
 * API client for provider/admin endpoints in Solopractice backend.
 * Used by provider dashboard and practice admin portal.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { apiClient, SoloPracticeApiError } from './solopractice-client';
import { env } from '@/lib/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Provider-specific types
export interface ProviderMessage {
  id: string;
  thread_id: string;
  patient_id: string;
  patient_name?: string;
  sender_id: string;
  content: string;
  attachments?: Record<string, unknown>;
  status: 'new' | 'in_progress' | 'resolved';
  urgency: 'green' | 'yellow' | 'red';
  read: boolean;
  read_at?: string;
  created_at: string;
  due_at?: string;
  assigned_to?: string;
  assigned_to_name?: string;
}

export interface WorkItem {
  id: string;
  type: 'message' | 'refill' | 'vital_alert' | 'appointment' | 'other';
  patient_id: string;
  patient_name?: string;
  title: string;
  description?: string;
  urgency: 'green' | 'yellow' | 'red';
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  due_at?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  metadata?: Record<string, unknown>;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  mrn?: string;
  practice_id: string;
  active: boolean;
  last_message_at?: string;
  last_vital_at?: string;
  created_at: string;
}

export interface PracticeSettings {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  hours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  timezone: string;
  emergency_contact?: string;
  branding?: {
    logo_url?: string;
    primary_color?: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'md' | 'np' | 'ma' | 'staff';
  active: boolean;
  on_call?: boolean;
  created_at: string;
}

export interface DashboardStats {
  messages: {
    total: number;
    new: number;
    in_progress: number;
    overdue: number;
    by_urgency: {
      red: number;
      yellow: number;
      green: number;
    };
  };
  work_items: {
    total: number;
    new: number;
    in_progress: number;
    overdue: number;
    by_type: {
      message: number;
      refill: number;
      vital_alert: number;
      appointment: number;
    };
  };
  patients: {
    total: number;
    active: number;
    new_this_month: number;
  };
  sla: {
    on_time: number;
    at_risk: number;
    overdue: number;
  };
}

export interface ReplyMessageRequest {
  body: string;
  attachments?: Record<string, unknown>;
}

export interface AssignRequest {
  assigned_to: string;
}

export interface UpdateWorkItemRequest {
  status?: 'new' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  notes?: string;
}

export class ProviderApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Use the same auth token from the main API client
    this.client.interceptors.request.use(
      (config) => {
        const token = apiClient.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError | Error | unknown): SoloPracticeApiError {
    // Handle null/undefined
    if (!error) {
      return new SoloPracticeApiError('Unknown error occurred', 0);
    }

    // Handle AxiosError with response
    if (error && typeof error === 'object' && 'response' in error && (error as AxiosError).response) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 0;
      const data = axiosError.response?.data as { message?: string; error?: string };

      return new SoloPracticeApiError(
        data?.message || data?.error || 'API request failed',
        status,
        data?.code
      );
    }

    // Handle Error with message
    if (error instanceof Error) {
      return new SoloPracticeApiError(error.message || 'Network error', 0);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new SoloPracticeApiError(error, 0);
    }

    // Fallback
    return new SoloPracticeApiError('Network error', 0);
  }

  // Authentication
  async login(email: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
    practice_id: string;
    user_id: string;
    role: 'provider' | 'admin';
  }> {
    // Create a separate client for login (no auth token required)
    const loginClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const response = await loginClient.post('/api/provider/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/api/provider/dashboard/stats');
    return response.data;
  }

  // Messages
  async getMessages(filters?: {
    status?: string;
    urgency?: string;
    assigned_to?: string;
    patient_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProviderMessage[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.urgency) params.append('urgency', filters.urgency);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.patient_id) params.append('patient_id', filters.patient_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get<ProviderMessage[]>(
      `/api/provider/messages?${params.toString()}`
    );
    return response.data;
  }

  async getMessage(messageId: string): Promise<ProviderMessage> {
    const response = await this.client.get<ProviderMessage>(`/api/provider/messages/${messageId}`);
    return response.data;
  }

  async replyToMessage(messageId: string, request: ReplyMessageRequest): Promise<ProviderMessage> {
    const response = await this.client.post<ProviderMessage>(
      `/api/provider/messages/${messageId}/reply`,
      request
    );
    return response.data;
  }

  async assignMessage(messageId: string, request: AssignRequest): Promise<void> {
    await this.client.patch(`/api/provider/messages/${messageId}/assign`, request);
  }

  async updateMessageStatus(messageId: string, status: string): Promise<void> {
    await this.client.patch(`/api/provider/messages/${messageId}/status`, { status });
  }

  // Work Items
  async getWorkItems(filters?: {
    type?: string;
    status?: string;
    urgency?: string;
    assigned_to?: string;
    patient_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<WorkItem[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.urgency) params.append('urgency', filters.urgency);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.patient_id) params.append('patient_id', filters.patient_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get<WorkItem[]>(
      `/api/provider/work-items?${params.toString()}`
    );
    return response.data;
  }

  async getWorkItem(workItemId: string): Promise<WorkItem> {
    const response = await this.client.get<WorkItem>(`/api/provider/work-items/${workItemId}`);
    return response.data;
  }

  async updateWorkItem(workItemId: string, request: UpdateWorkItemRequest): Promise<WorkItem> {
    const response = await this.client.patch<WorkItem>(
      `/api/provider/work-items/${workItemId}`,
      request
    );
    return response.data;
  }

  async assignWorkItem(workItemId: string, request: AssignRequest): Promise<void> {
    await this.client.patch(`/api/provider/work-items/${workItemId}/assign`, request);
  }

  // Patients
  async getPatients(filters?: {
    search?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Patient[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.active !== undefined) params.append('active', filters.active.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get<Patient[]>(
      `/api/provider/patients?${params.toString()}`
    );
    return response.data;
  }

  async getPatient(patientId: string): Promise<Patient> {
    const response = await this.client.get<Patient>(`/api/provider/patients/${patientId}`);
    return response.data;
  }

  async getPatientMessages(patientId: string): Promise<ProviderMessage[]> {
    const response = await this.client.get<ProviderMessage[]>(
      `/api/provider/patients/${patientId}/messages`
    );
    return response.data;
  }

  async getPatientVitals(patientId: string): Promise<unknown[]> {
    const response = await this.client.get(`/api/provider/patients/${patientId}/vitals`);
    return response.data;
  }

  async getPatientMedications(patientId: string): Promise<Array<{ id: string; name: string; dosage: string; frequency: string }>> {
    const response = await this.client.get(`/api/provider/patients/${patientId}/medications`);
    return response.data;
  }

  // Practice Settings
  async getPracticeSettings(): Promise<PracticeSettings> {
    const response = await this.client.get<PracticeSettings>('/api/provider/practice/settings');
    return response.data;
  }

  async updatePracticeSettings(settings: Partial<PracticeSettings>): Promise<PracticeSettings> {
    const response = await this.client.put<PracticeSettings>(
      '/api/provider/practice/settings',
      settings
    );
    return response.data;
  }

  // Staff Management
  async getStaff(): Promise<StaffMember[]> {
    const response = await this.client.get<StaffMember[]>('/api/provider/staff');
    return response.data;
  }

  async addStaff(member: {
    name: string;
    email: string;
    role: string;
  }): Promise<StaffMember> {
    const response = await this.client.post<StaffMember>('/api/provider/staff', member);
    return response.data;
  }

  async updateStaff(staffId: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    const response = await this.client.patch<StaffMember>(
      `/api/provider/staff/${staffId}`,
      updates
    );
    return response.data;
  }

  async removeStaff(staffId: string): Promise<void> {
    await this.client.delete(`/api/provider/staff/${staffId}`);
  }

  // Patient Onboarding
  async generateActivationToken(patientId: string): Promise<{ token: string; expires_at: string }> {
    const response = await this.client.post(`/api/provider/patients/${patientId}/activation-token`);
    return response.data;
  }

  async sendActivationLink(patientId: string, method: 'email' | 'sms'): Promise<void> {
    await this.client.post(`/api/provider/patients/${patientId}/send-activation`, { method });
  }
}

// Singleton instance
export const providerApiClient = new ProviderApiClient();
