/**
 * Domain Types
 * Single source of truth for shared types.
 * Import from here, do not redefine.
 */

import type {
  UserRole,
  UserStatus,
  Language,
  Gender,
  VitalType,
  VitalSource,
  MessageType,
  MessagePriority,
  TaskStatus,
  TaskPriority,
  AlertSeverity,
  AlertStatus,
  EncounterType,
  EncounterStatus,
  EncounterState,
} from './enums';

export type UUID = string;

// User Types
export interface User {
  id: UUID;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// Patient Types
export interface Patient {
  id: UUID;
  user_id: UUID;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: Gender | null;
  phone: string | null;
  preferred_language: Language | null;
  created_at: string;
  updated_at: string;
}

// Vital Types
export interface Vital {
  id: UUID;
  patient_id: UUID;
  type: VitalType;
  value: string;
  value_secondary: string | null;
  unit: string;
  source: VitalSource;
  measured_at: string;
  notes: string | null;
  is_abnormal: boolean;
  abnormal_reason: string | null;
  created_at: string;
}

// Message Types
export interface Message {
  id: UUID;
  thread_id: UUID;
  sender_id: UUID;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  read: boolean;
  created_at: string;
}

export interface MessageThread {
  id: UUID;
  patient_id: UUID;
  subject: string | null;
  status: string;
  priority: MessagePriority;
  has_red_flag: boolean;
  red_flag_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Task Types
export interface Task {
  id: UUID;
  patient_id: UUID;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

// Alert Types
export interface Alert {
  id: UUID;
  patient_id: UUID;
  type: string;
  priority: AlertSeverity;
  message: string;
  status: AlertStatus;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Encounter Types
export interface Encounter {
  id: UUID;
  patient_id: UUID;
  clinician_id: UUID | null;
  type: EncounterType;
  status: EncounterStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  state: EncounterState;
  created_at: string;
}

// State Machine Types
export interface CaptureSessionDiagnostics {
  streamActive: boolean;
  recordingActive: boolean;
  audioLevel: number;
  error: string | null;
  permissions: {
    microphone: 'granted' | 'denied' | 'prompt';
  };
  lastError: {
    code: string;
    message: string;
    timestamp: string;
  } | null;
}
