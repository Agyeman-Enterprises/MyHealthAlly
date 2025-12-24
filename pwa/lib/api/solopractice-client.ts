/**
 * Solopractice API Client
 * 
 * Thin client for Solopractice backend API.
 * All CG rules (R1-R12) enforced server-side.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface ActivateAccountRequest {
  token: string;
}

export interface ActivateAccountResponse {
  access_token: string;
  refresh_token: string;
  patient_id: string;
  practice_id: string;
}

export interface SymptomScreenResult {
  has_chest_pain?: boolean;
  has_shortness_of_breath?: boolean;
  has_severe_bleeding?: boolean;
  has_severe_allergic_reaction?: boolean;
  has_loss_of_consciousness?: boolean;
  has_severe_burn?: boolean;
  has_severe_head_injury?: boolean;
  has_severe_abdominal_pain?: boolean;
  other_emergency_symptoms?: string;
}

export interface SendMessageRequest {
  body: string;
  symptom_screen?: SymptomScreenResult;
  attachments?: Record<string, any>;
  detected_language?: string; // Language detected from voice/text (e.g., 'ko', 'es', 'ch')
  preferred_language?: string; // Patient's preferred language for responses
}

export interface MessageResponse {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  attachments?: Record<string, any>;
  status: 'sent' | 'after_hours_deferred' | 'blocked';
  read: boolean;
  read_at?: string;
  created_at: string;
  next_open_at?: string;
  action?: string;
  reason?: string;
  message?: string;
}

export interface MessageThread {
  id: string;
  patient_id: string;
  clinic_id?: string;
  subject?: string;
  last_message_at?: string;
  created_at: string;
}

export interface RecordMeasurementRequest {
  type: string;
  value: Record<string, any>;
  source?: string;
  metadata?: Record<string, any>;
}

export interface MeasurementResponse {
  id: string;
  patient_id: string;
  type: string;
  value: Record<string, any>;
  timestamp: string;
  source: string;
  urgency?: 'green' | 'yellow' | 'red';
  escalated?: boolean;
  created_at: string;
}

export interface RefillRequestRequest {
  medication_id: string;
}

export interface RefillRequestResponse {
  id: string;
  medication_id: string;
  status: 'approved' | 'blocked' | 'pending';
  reason?: string;
  required_labs?: string[];
  created_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  refills_remaining?: number;
  last_filled?: string;
}

export class SoloPracticeApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public errorCode?: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'SoloPracticeApiError';
  }
}

export class SoloPracticeApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry original request
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            this.clearTokens();
            throw new SoloPracticeApiError('Unauthorized', 401);
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      if (typeof window !== 'undefined') {
        this.refreshToken = localStorage.getItem('refresh_token');
      }
      if (!this.refreshToken) throw new Error('No refresh token');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/portal/auth/refresh`,
      { refresh_token: this.refreshToken }
    );

    const { access_token, refresh_token } = response.data;
    this.setTokens(access_token, refresh_token);
  }

  private handleError(error: AxiosError): SoloPracticeApiError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 403) {
        return new SoloPracticeApiError(
          data?.message || 'Action blocked by safety rule',
          403,
          data?.code
        );
      }

      if (status === 429) {
        return new SoloPracticeApiError(
          'Rate limited',
          429,
          undefined,
          data?.retry_after || 60
        );
      }

      return new SoloPracticeApiError(
        data?.message || 'API request failed',
        status,
        data?.code
      );
    }

    return new SoloPracticeApiError(
      error.message || 'Network error',
      0
    );
  }

  // Authentication
  async activateAccount(token: string): Promise<ActivateAccountResponse> {
    const response = await this.client.post<ActivateAccountResponse>(
      '/api/portal/auth/activate',
      { token }
    );
    this.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  // Messages
  async getThreads(): Promise<MessageThread[]> {
    const response = await this.client.get<MessageThread[]>('/api/portal/messages/threads');
    return response.data;
  }

  async getThreadMessages(threadId: string): Promise<MessageResponse[]> {
    const response = await this.client.get<MessageResponse[]>(
      `/api/portal/messages/threads/${threadId}`
    );
    return response.data;
  }

  async sendMessage(
    threadId: string,
    request: SendMessageRequest
  ): Promise<MessageResponse> {
    const response = await this.client.post<MessageResponse>(
      `/api/portal/messages/threads/${threadId}/messages`,
      request
    );
    return response.data;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.client.patch(`/api/portal/messages/${messageId}/read`);
  }

  // Medications
  async getMedications(): Promise<Medication[]> {
    const response = await this.client.get<Medication[]>('/api/portal/meds');
    return response.data;
  }

  async requestRefill(medicationId: string): Promise<RefillRequestResponse> {
    const response = await this.client.post<RefillRequestResponse>(
      '/api/portal/meds/refill-requests',
      { medication_id: medicationId }
    );
    return response.data;
  }

  // Measurements
  async recordMeasurement(request: RecordMeasurementRequest): Promise<MeasurementResponse> {
    const response = await this.client.post<MeasurementResponse>(
      '/api/portal/measurements',
      request
    );
    return response.data;
  }

  async getMeasurements(type?: string, limit: number = 100): Promise<MeasurementResponse[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit.toString());

    const response = await this.client.get<MeasurementResponse[]>(
      `/api/portal/measurements?${params.toString()}`
    );
    return response.data;
  }

  // Appointments
  async requestAppointment(request: {
    type: string;
    preferred_date?: string;
    preferred_time?: string;
    reason?: string;
    urgency?: string;
  }): Promise<{ id: string; type: string; status: string; requested_at: string }> {
    const response = await this.client.post(
      '/api/portal/appointments/request',
      request
    );
    return response.data;
  }
}

// Singleton instance
export const apiClient = new SoloPracticeApiClient();
