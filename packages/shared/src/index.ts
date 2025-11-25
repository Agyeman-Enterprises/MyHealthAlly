// User types
export enum UserRole {
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
  MEDICAL_ASSISTANT = 'MEDICAL_ASSISTANT',
  ADMIN = 'ADMIN',
}

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  clinicId?: string;
  patientId?: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Clinic types
export interface Clinic {
  id: string;
  name: string;
  brandingConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Patient types
export interface Patient {
  id: string;
  userId: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  demographics?: Record<string, any>;
  flags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Measurement types
export enum MeasurementType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  GLUCOSE = 'GLUCOSE',
  WEIGHT = 'WEIGHT',
  HEART_RATE = 'HEART_RATE',
  STEPS = 'STEPS',
  SLEEP = 'SLEEP',
  HRV = 'HRV',
}

export interface Measurement {
  id: string;
  patientId: string;
  type: MeasurementType;
  value: number | Record<string, any>;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Care Plan types
export interface CarePlanPhase {
  phase: number;
  name: string;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  tasks?: CarePlanTask[];
}

export interface CarePlanTask {
  id: string;
  type: 'MEDICATION' | 'HABIT' | 'TRACKING' | 'EDUCATION' | 'VISIT';
  title: string;
  subtitle?: string;
  status: 'DUE' | 'OVERDUE' | 'COMPLETED';
  dueDate?: Date;
  completedAt?: Date;
}

export interface CarePlan {
  id: string;
  patientId: string;
  phases: CarePlanPhase[];
  createdAt: Date;
  updatedAt: Date;
}

// Alert types
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  BP_HIGH_TREND = 'BP_HIGH_TREND',
  GLUCOSE_HIGH = 'GLUCOSE_HIGH',
  NO_DATA = 'NO_DATA',
  VISIT_REQUESTED = 'VISIT_REQUESTED',
  MEDICATION_ADHERENCE = 'MEDICATION_ADHERENCE',
}

export interface Alert {
  id: string;
  patientId: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  body: string;
  payload?: Record<string, any>;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  resolvedAt?: Date;
}

// Risk assessment
export enum RiskLevel {
  STABLE = 'STABLE',
  WORSENING = 'WORSENING',
  HIGH_RISK = 'HIGH_RISK',
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth types
export interface DeviceRegistrationInput {
  deviceId: string;
  deviceName?: string;
  platform: DevicePlatform | keyof typeof DevicePlatform | 'IOS' | 'ANDROID' | 'WEB';
  appVersion?: string;
  idleTimeoutSeconds?: number;
}

export interface DeviceSummary {
  id: string;
  deviceId: string;
  deviceName?: string;
  platform: DevicePlatform | keyof typeof DevicePlatform | 'IOS' | 'ANDROID' | 'WEB';
  biometricEnabled: boolean;
  pinEnabled: boolean;
  idleTimeoutSeconds: number;
  lastUnlockAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SessionSummary {
  id: string;
  lastActiveAt: Date | string;
  expiresAt: Date | string;
  idleTimeoutSeconds: number;
}

export interface LoginDto {
  email: string;
  password: string;
  device?: Partial<DeviceRegistrationInput>;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: UserRole;
  clinicId?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  device?: DeviceSummary;
  session?: SessionSummary;
}

// Visit Request types
export interface VisitRequest {
  id: string;
  patientId: string;
  type: 'MA_CHECK' | 'PROVIDER';
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  requestedAt: Date;
  scheduledAt?: Date;
  notes?: string;
}

// Rules Engine types
export * from './rules';

