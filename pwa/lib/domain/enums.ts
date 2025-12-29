/**
 * Domain Enums
 * Single source of truth for ALL enums used across frontend/backend.
 * DO NOT duplicate these enums elsewhere.
 */

// User & Auth
export const UserRole = ['patient', 'clinician', 'provider', 'care_coordinator', 'admin'] as const;
export type UserRole = typeof UserRole[number];

export const UserStatus = ['active', 'inactive', 'pending_verification', 'suspended'] as const;
export type UserStatus = typeof UserStatus[number];

// Languages
export const Language = ['en', 'ch', 'chu', 'mh', 'es', 'fil'] as const;
export type Language = typeof Language[number];

// Patient
export const Gender = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = typeof Gender[number];

// Vitals
export const VitalType = [
  'blood_pressure',
  'heart_rate',
  'hrv',
  'weight',
  'bmi',
  'glucose',
  'spo2',
  'temperature',
  'respiratory_rate',
  'steps',
  'sleep_hours',
  'sleep_quality',
] as const;
export type VitalType = typeof VitalType[number];

export const VitalSource = [
  'manual',
  'apple_health',
  'fitbit',
  'oura',
  'garmin',
  'withings',
  'dexcom',
  'freestyle_libre',
  'omron',
  'device_other',
] as const;
export type VitalSource = typeof VitalSource[number];

// Messages
export const MessageType = ['text', 'voice', 'image', 'document', 'system'] as const;
export type MessageType = typeof MessageType[number];

export const MessagePriority = ['normal', 'urgent', 'emergency'] as const;
export type MessagePriority = typeof MessagePriority[number];

// Tasks
export const TaskStatus = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'] as const;
export type TaskStatus = typeof TaskStatus[number];

export const TaskPriority = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = typeof TaskPriority[number];

// Alerts
export const AlertSeverity = ['info', 'low', 'medium', 'high', 'critical'] as const;
export type AlertSeverity = typeof AlertSeverity[number];

export const AlertStatus = ['active', 'acknowledged', 'resolved', 'dismissed'] as const;
export type AlertStatus = typeof AlertStatus[number];

// Encounters
export const EncounterType = [
  'initial_consult',
  'follow_up',
  'telehealth',
  'in_person',
  'walk_in',
  'urgent',
  'lab_review',
  'care_coordination',
] as const;
export type EncounterType = typeof EncounterType[number];

export const EncounterStatus = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;
export type EncounterStatus = typeof EncounterStatus[number];

// Care Plans
export const CarePlanStatus = ['draft', 'active', 'paused', 'completed', 'archived'] as const;
export type CarePlanStatus = typeof CarePlanStatus[number];

// State Machines
export const EncounterState = [
  'DRAFT',
  'SCHEDULED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'RECORDING',
  'TRANSCRIBING',
  'NOTE_DRAFT',
  'NOTE_REVIEW',
  'NOTE_SIGNED',
  'FINALIZED',
  'CANCELLED',
] as const;
export type EncounterState = typeof EncounterState[number];

export const CaptureSessionState = [
  'IDLE',
  'INITIALIZING',
  'STREAM_ACTIVE',
  'RECORDING',
  'PAUSED',
  'STOPPING',
  'PROCESSING',
  'COMPLETE',
  'FAILED',
  'ABORTED',
] as const;
export type CaptureSessionState = typeof CaptureSessionState[number];

export const NoteState = ['DRAFT', 'AUTO_SAVED', 'SUBMITTED', 'UNDER_REVIEW', 'SIGNED', 'AMENDED', 'FINALIZED', 'LOCKED'] as const;
export type NoteState = typeof NoteState[number];

export const ExportJobState = ['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING'] as const;
export type ExportJobState = typeof ExportJobState[number];
