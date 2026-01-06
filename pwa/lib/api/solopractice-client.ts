/**
 * Solopractice API Client
 * 
 * Thin client for Solopractice backend API.
 * All CG rules (R1-R12) enforced server-side.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { env } from '@/lib/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export type SPCreateOrGetPatientInput = {
  tenantPracticeId: string; // maps to your practice_id
  mhaUserId: string;
  mhaPatientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  email: string | null;
};

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
  attachments?: Record<string, unknown>;
  detected_language?: string; // Language detected from voice/text (e.g., 'ko', 'es', 'ch')
  preferred_language?: string; // Patient's preferred language for responses
  recipient?: string; // Recipient category: 'care-team', 'md-{clinicianId}', 'nurse', 'billing', 'scheduling'
  subject?: string; // Message subject for routing and organization
  category?: string; // Message category for routing: 'general', 'billing', 'clinical', 'scheduling'
}

export interface MessageResponse {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  attachments?: Record<string, unknown>;
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
  value: Record<string, unknown>;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface MeasurementResponse {
  id: string;
  patient_id: string;
  type: string;
  value: Record<string, unknown>;
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

export type PlanTier = 'Essential' | 'Complete' | 'Family' | 'Premium';

export type PatientRequestType = 'lab' | 'refill' | 'referral' | 'question' | 'appointment' | 'results';

export type PatientRequestStatus = 'NEW' | 'PEND' | 'DONE';

export interface PatientRequestPayload {
  id?: string;
  type: PatientRequestType;
  patient: {
    id: string;
    name: string;
    planTier: PlanTier;
    planUsage?: string; // e.g., "3/4" for Essential
  };
  summary: string; // e.g., "CBC, CMP, A1C" or "Lisinopril 10mg"
  details?: Record<string, unknown>;
  priority?: 'red' | 'yellow' | 'green';
  submitted_at?: string;
  source?: 'mha';
}

export interface PatientRequestResponse {
  id: string;
  status: PatientRequestStatus;
  received_at: string;
}

export interface SoloPracticeUpdate {
  id: string;
  type: PatientRequestType;
  status: PatientRequestStatus;
  actionTaken?: 'approve' | 'deny' | 'edit' | 'message' | 'schedule' | 'escalate';
  messageToPatient?: string;
  attachments?: Array<{ type: string; url: string; name?: string }>;
  scheduledAt?: string;
  reviewedBy?: string;
  updatedAt?: string;
  planTier?: PlanTier;
  planUsage?: string;
}

// MHA -> SoloPractice DTOs
export interface LabOrderRequest {
  patient_id: string;
  tests: string[];
  priority?: 'routine' | 'urgent';
  notes?: string;
}

export interface RefillRequestPayload {
  patient_id: string;
  medication_id: string;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  pharmacy?: string;
  notes?: string;
}

export interface ReferralRequestPayload {
  patient_id: string;
  specialty: string;
  reason?: string;
  priority?: 'routine' | 'urgent';
  notes?: string;
}

export interface AppointmentRequestPayload {
  patient_id: string;
  type: string;
  preferred_date?: string;
  preferred_time?: string;
  reason?: string;
  urgency?: string;
}

export interface HealthLogPayload {
  patient_id: string;
  category: string;
  entry: Record<string, unknown>;
  recorded_at?: string;
}

export interface PatientMessagePayload {
  patient_id: string;
  thread_id?: string;
  body: string;
  attachments?: Record<string, unknown>;
}

export interface PatientTierResponse {
  patient_id: string;
  tier: PlanTier;
  usage?: string;
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

  // --- HARD GUARD: call before any clinical mutation ---
  private assertAttached(ctx: { attachmentStatus?: string; practiceId?: string; spPatientId?: string | null }) {
    if (ctx.attachmentStatus !== 'ATTACHED' || !ctx.practiceId) {
      throw new Error('Patient not attached to a practice');
    }
  }

  /**
   * Load patient attachment context for guard checks
   * Uses getCurrentUserAndPatient() to get attachment state from DB (not Zustand)
   */
  private async loadPatientContext(): Promise<{ attachmentStatus?: string; practiceId?: string; spPatientId?: string | null }> {
    try {
      const { getCurrentUserAndPatient } = await import('@/lib/supabase/queries-settings');
      const { patient } = await getCurrentUserAndPatient();

      if (!patient) {
        return {};
      }

      const result: {
        attachmentStatus?: string;
        practiceId?: string;
        spPatientId?: string | null;
      } = {};
      if (patient.attachment_status) result.attachmentStatus = patient.attachment_status;
      if (patient.practice_id) result.practiceId = patient.practice_id;
      if (patient.sp_patient_id !== undefined) result.spPatientId = patient.sp_patient_id;
      return result;
    } catch {
      return {};
    }
  }

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
        // Get token from instance or localStorage
        // Note: Auth store sync should be done via syncAuthTokensToApiClient() before API calls
        let token = this.accessToken;
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('access_token');
        }
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          } catch {
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

  private handleError(error: AxiosError | Error | unknown): SoloPracticeApiError {
    // Handle null/undefined
    if (!error) {
      return new SoloPracticeApiError('Unknown error occurred', 0);
    }

    // Handle AxiosError with response
    if (error && typeof error === 'object' && 'response' in error && (error as AxiosError).response) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 0;
      const data = axiosError.response?.data as { message?: string; error?: string; code?: string | number; retry_after?: number };

      if (status === 403) {
        return new SoloPracticeApiError(
          data?.message || 'Action blocked by safety rule',
          403,
          data?.code !== undefined && data?.code !== null ? String(data.code) : undefined
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
        data?.message || data?.error || 'API request failed',
        status,
        data?.code !== undefined && data?.code !== null ? String(data.code) : undefined
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
  async activateAccount(token: string): Promise<ActivateAccountResponse> {
    const response = await this.client.post<ActivateAccountResponse>(
      '/api/portal/auth/activate',
      { token }
    );
    this.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  /**
   * Explicit SP patient provisioning.
   * This must NOT be triggered by sending a message or recording vitals.
   */
  async createOrGetPatient(input: SPCreateOrGetPatientInput): Promise<{ spPatientId: string }> {
    // You must implement this endpoint server-side in your SP service.
    // It should be idempotent: if exists, return existing spPatientId.
    const res = await fetch('/api/solopractice/patients/create-or-get', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`SP createOrGetPatient failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as { spPatientId: string };
    if (!json?.spPatientId) throw new Error('SP createOrGetPatient returned no spPatientId');
    return json;
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
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
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
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<RefillRequestResponse>(
      '/api/portal/meds/refill-requests',
      { medication_id: medicationId }
    );
    return response.data;
  }

  // Measurements
  async recordMeasurement(request: RecordMeasurementRequest): Promise<MeasurementResponse> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
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
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post(
      '/api/portal/appointments/request',
      request
    );
    return response.data;
  }

  // Patient request queue (aligns with SoloPractice UI)
  async submitPatientRequest(payload: PatientRequestPayload): Promise<PatientRequestResponse> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<PatientRequestResponse>(
      '/api/portal/patient-requests',
      payload
    );
    return response.data;
  }

  // Canon endpoints MHA -> SoloPractice
  async createLabOrder(payload: LabOrderRequest): Promise<{ id: string }> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<{ id: string }>('/api/mha/lab-order', payload);
    return response.data;
  }

  async createRefillRequest(payload: RefillRequestPayload): Promise<{ id: string }> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<{ id: string }>('/api/mha/refill-request', payload);
    return response.data;
  }

  async createReferralRequest(payload: ReferralRequestPayload): Promise<{ id: string }> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<{ id: string }>('/api/mha/referral-request', payload);
    return response.data;
  }

  async createAppointmentRequest(payload: AppointmentRequestPayload): Promise<{ id: string }> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<{ id: string }>('/api/mha/appointment-request', payload);
    return response.data;
  }

  async createHealthLog(payload: HealthLogPayload): Promise<{ id: string }> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<{ id: string }>('/api/mha/health-log', payload);
    return response.data;
  }

  async sendPatientMessage(payload: PatientMessagePayload): Promise<{ id: string; thread_id: string }> {
    const ctx = await this.loadPatientContext();
    this.assertAttached(ctx);
    
    const response = await this.client.post<{ id: string; thread_id: string }>('/api/mha/message', payload);
    return response.data;
  }

  async getPatientTier(patientId: string): Promise<PatientTierResponse> {
    const response = await this.client.get<PatientTierResponse>(`/api/mha/patient/${patientId}/tier`);
    return response.data;
  }
}

// Singleton instance
export const apiClient = new SoloPracticeApiClient();

// Map SoloPractice updates to patient-facing timeline/notification text
export function mapSoloPracticeUpdateToPatientMessage(update: SoloPracticeUpdate): {
  title: string;
  body: string;
  category: 'lab' | 'refill' | 'referral' | 'appointment' | 'message' | 'general';
} {
  const { type, actionTaken, messageToPatient, status, scheduledAt } = update;

  if (type === 'lab') {
    if (status === 'DONE' && messageToPatient) return { title: 'Lab results reviewed', body: messageToPatient, category: 'lab' };
    if (actionTaken === 'approve') return { title: 'Lab order placed', body: messageToPatient || 'Your lab order has been placed.', category: 'lab' };
    if (actionTaken === 'deny') return { title: 'Lab request declined', body: messageToPatient || 'Please check your messages for details.', category: 'lab' };
    return { title: 'Lab request update', body: messageToPatient || 'Your lab request is being reviewed.', category: 'lab' };
  }

  if (type === 'refill') {
    if (actionTaken === 'approve') return { title: 'Refill approved', body: messageToPatient || 'Your prescription refill was approved.', category: 'refill' };
    if (actionTaken === 'deny') return { title: 'Refill declined', body: messageToPatient || 'Please check your messages for next steps.', category: 'refill' };
    return { title: 'Refill request update', body: messageToPatient || 'Your refill request is being reviewed.', category: 'refill' };
  }

  if (type === 'referral') {
    if (actionTaken === 'schedule' && scheduledAt) {
      return { title: 'Referral scheduled', body: `Appointment scheduled for ${new Date(scheduledAt).toLocaleString()}. ${messageToPatient || ''}`.trim(), category: 'referral' };
    }
    if (actionTaken === 'approve') {
      return { title: 'Referral created', body: messageToPatient || 'Your referral has been created.', category: 'referral' };
    }
    if (actionTaken === 'deny') {
      return { title: 'Referral declined', body: messageToPatient || 'Please check your messages for details.', category: 'referral' };
    }
    return { title: 'Referral update', body: messageToPatient || 'Your referral request is being reviewed.', category: 'referral' };
  }

  if (type === 'appointment') {
    if (actionTaken === 'schedule' && scheduledAt) {
      return { title: 'Appointment scheduled', body: `Your appointment is set for ${new Date(scheduledAt).toLocaleString()}. ${messageToPatient || ''}`.trim(), category: 'appointment' };
    }
    if (actionTaken === 'deny') {
      return { title: 'Appointment request declined', body: messageToPatient || 'Please choose another time.', category: 'appointment' };
    }
    return { title: 'Appointment update', body: messageToPatient || 'Your appointment request is being reviewed.', category: 'appointment' };
  }

  if (type === 'question') {
    return { title: 'Clinician response', body: messageToPatient || 'You have a new message from your care team.', category: 'message' };
  }

  if (type === 'results') {
    return { title: 'Results update', body: messageToPatient || 'Your results have been updated.', category: 'general' };
  }

  return { title: 'Care update', body: messageToPatient || 'Your care team sent an update.', category: 'general' };
}
