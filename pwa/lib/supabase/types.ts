/**
 * TypeScript types for Supabase database tables
 * Generated from schema files 01-07
 */

// Enums
export type UserRole = 'patient' | 'clinician' | 'provider' | 'care_coordinator' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended';
export type Language = 'en' | 'ch' | 'chu' | 'mh' | 'es' | 'fil';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type VitalType = 'blood_pressure' | 'heart_rate' | 'hrv' | 'weight' | 'bmi' | 'glucose' | 'spo2' | 'temperature' | 'respiratory_rate' | 'steps' | 'sleep_hours' | 'sleep_quality';
export type MessagePriority = 'normal' | 'urgent' | 'emergency';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

// Database Table Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Patient, 'id' | 'created_at'>>;
      };
      clinicians: {
        Row: Clinician;
        Insert: Omit<Clinician, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Clinician, 'id' | 'created_at'>>;
      };
      vitals: {
        Row: Vital;
        Insert: Omit<Vital, 'id' | 'created_at'>;
        Update: Partial<Omit<Vital, 'id' | 'created_at'>>;
      };
      message_threads: {
        Row: MessageThread;
        Insert: Omit<MessageThread, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MessageThread, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
      alerts: {
        Row: Alert;
        Insert: Omit<Alert, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Alert, 'id' | 'created_at'>>;
      };
    };
  };
}

// User
export interface User {
  id: string;
  supabase_auth_id: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  preferred_language: Language;
  communication_language: Language;
  brand: string;
  timezone: string | null;
  pin_hash: string | null;
  biometric_enabled: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  notification_settings: {
    push: boolean;
    sms: boolean;
    email: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

// Patient
export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string;
  gender: Gender | null;
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  } | null;
  insurance_type: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_group_number: string | null;
  insurance_card_front_url: string | null;
  insurance_card_back_url: string | null;
  cofa_status: string | null;
  cofa_document_url: string | null;
  primary_clinician_id: string | null;
  medical_record_number: string | null;
  chronic_conditions: string[];
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  height_inches: number | null;
  glp1_eligible: boolean;
  glp1_start_date: string | null;
  glp1_current_medication: string | null;
  rpm_enrolled: boolean;
  rpm_enrollment_date: string | null;
  ccm_enrolled: boolean;
  ccm_enrollment_date: string | null;
  onboarding_completed_at: string | null;
  intake_completed_at: string | null;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  vital_reminders: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Clinician
export interface Clinician {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  credentials: string | null;
  npi_number: string | null;
  license_number: string | null;
  license_state: string | null;
  specialties: string[];
  bio: string | null;
  avatar_url: string | null;
  accepting_new_patients: boolean;
  default_appointment_duration: number;
  schedule_settings: {
    workingDays: number[];
    workingHoursStart: string;
    workingHoursEnd: string;
    lunchStart?: string;
    lunchEnd?: string;
    slotDuration: number;
  } | null;
  languages_spoken: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Vital
export interface Vital {
  id: string;
  patient_id: string;
  type: VitalType;
  value: number;
  value_secondary: number | null;
  unit: string;
  source: string;
  device_id: string | null;
  measured_at: string;
  rpm_eligible: boolean;
  rpm_transmitted: boolean;
  rpm_transmitted_at: string | null;
  notes: string | null;
  is_abnormal: boolean;
  abnormal_reason: string | null;
  reviewed_by_clinician_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Message Thread
export interface MessageThread {
  id: string;
  patient_id: string;
  subject: string | null;
  status: string;
  priority: MessagePriority;
  has_red_flag: boolean;
  red_flag_reason: string | null;
  red_flag_acknowledged_at: string | null;
  red_flag_acknowledged_by_user_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  patient_unread_count: number;
  clinician_unread_count: number;
  // SLA tracking fields
  sla_started_at: string | null;
  sla_deadline: string | null;
  sla_status: 'pending' | 'active' | 'completed' | 'overdue' | null;
  sla_initial_response_at: string | null;
  sla_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Message
export interface Message {
  id: string;
  thread_id: string;
  sender_user_id: string;
  sender_role: string;
  type: string;
  content: string | null;
  content_language: Language;
  translations: Record<string, string>;
  voice_url: string | null;
  voice_duration_seconds: number | null;
  voice_transcript: string | null;
  voice_transcript_language: Language | null;
  attachments: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
  }>;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  has_red_flag: boolean;
  red_flag_type: string | null;
  reply_to_message_id: string | null;
  created_at: string;
}

// Task
export interface Task {
  id: string;
  assignee_user_id: string;
  assignee_role: string;
  created_by_user_id: string | null;
  patient_id: string | null;
  title: string;
  description: string | null;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string | null;
  reminder_at: string | null;
  completed_at: string | null;
  completed_by_user_id: string | null;
  completion_notes: string | null;
  is_billable: boolean;
  billing_code_type: string | null;
  time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

// Alert
export interface Alert {
  id: string;
  patient_id: string;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  trigger_data: Record<string, any> | null;
  assigned_to_user_id: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

