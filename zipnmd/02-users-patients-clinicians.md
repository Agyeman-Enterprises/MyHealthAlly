#### 3.2.2 Users & Authentication

```typescript
// src/schema/users.ts
import { pgTable, uuid, varchar, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { userRoleEnum, userStatusEnum, languageEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Supabase Auth link
  supabaseAuthId: uuid('supabase_auth_id').unique(),
  
  // Basic info
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  
  // Role & status
  role: userRoleEnum('role').notNull().default('patient'),
  status: userStatusEnum('status').notNull().default('pending_verification'),
  
  // Language preferences - KEY FOR i18n
  preferredLanguage: languageEnum('preferred_language').notNull().default('en'),
  communicationLanguage: languageEnum('communication_language').notNull().default('en'),
  
  // Brand association
  brand: varchar('brand', { length: 50 }).notNull().default('myhealthally'),
  
  // Timezone
  timezone: varchar('timezone', { length: 50 }).default('Pacific/Guam'),
  
  // Security
  pinHash: varchar('pin_hash', { length: 64 }),
  biometricEnabled: boolean('biometric_enabled').default(false),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  
  // Settings (JSON for flexibility)
  notificationSettings: jsonb('notification_settings').$type<{
    push: boolean;
    sms: boolean;
    email: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  }>().default({
    push: true,
    sms: true,
    email: true,
  }),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  emailVerifiedAt: timestamp('email_verified_at'),
  phoneVerifiedAt: timestamp('phone_verified_at'),
});

// User sessions for multi-device tracking
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  deviceType: varchar('device_type', { length: 20 }), // ios, android, web
  deviceId: varchar('device_id', { length: 255 }),
  deviceName: varchar('device_name', { length: 100 }),
  
  pushToken: varchar('push_token', { length: 500 }),
  
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  
  lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 3.2.3 Patients

```typescript
// src/schema/patients.ts
import { pgTable, uuid, varchar, date, text, boolean, integer, decimal, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { genderEnum, insuranceTypeEnum, cofaStatusEnum } from './enums';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Demographics
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  preferredName: varchar('preferred_name', { length: 100 }),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: genderEnum('gender'),
  
  // Contact
  address: jsonb('address').$type<{
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  
  // Emergency contact
  emergencyContact: jsonb('emergency_contact').$type<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>(),
  
  // Insurance
  insuranceType: insuranceTypeEnum('insurance_type'),
  insuranceProvider: varchar('insurance_provider', { length: 100 }),
  insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
  insuranceGroupNumber: varchar('insurance_group_number', { length: 100 }),
  insuranceCardFrontUrl: varchar('insurance_card_front_url', { length: 500 }),
  insuranceCardBackUrl: varchar('insurance_card_back_url', { length: 500 }),
  
  // COFA (Compact of Free Association) - for Pacific Island communities
  cofaStatus: cofaStatusEnum('cofa_status').default('not_applicable'),
  cofaDocumentUrl: varchar('cofa_document_url', { length: 500 }),
  
  // Medical info
  primaryClinicianId: uuid('primary_clinician_id'),
  medicalRecordNumber: varchar('medical_record_number', { length: 50 }),
  
  // Chronic conditions (for RPM/CCM eligibility)
  chronicConditions: jsonb('chronic_conditions').$type<string[]>().default([]),
  allergies: jsonb('allergies').$type<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[]>().default([]),
  
  // Baseline measurements
  heightInches: decimal('height_inches', { precision: 5, scale: 2 }),
  
  // GLP-1 tracking - FIRST CLASS CITIZEN
  glp1Eligible: boolean('glp1_eligible').default(false),
  glp1StartDate: date('glp1_start_date'),
  glp1CurrentMedication: varchar('glp1_current_medication', { length: 100 }),
  
  // RPM/CCM enrollment
  rpmEnrolled: boolean('rpm_enrolled').default(false),
  rpmEnrollmentDate: date('rpm_enrollment_date'),
  ccmEnrolled: boolean('ccm_enrolled').default(false),
  ccmEnrollmentDate: date('ccm_enrollment_date'),
  
  // Onboarding
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  intakeCompletedAt: timestamp('intake_completed_at'),
  
  // Preferences
  appointmentReminders: boolean('appointment_reminders').default(true),
  medicationReminders: boolean('medication_reminders').default(true),
  vitalReminders: boolean('vital_reminders').default(true),
  
  // Avatar
  avatarUrl: varchar('avatar_url', { length: 500 }),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Patient medical history
export const patientMedicalHistory = pgTable('patient_medical_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  pastMedicalHistory: jsonb('past_medical_history').$type<{
    condition: string;
    diagnosedYear?: number;
    status: 'active' | 'resolved';
    notes?: string;
  }[]>().default([]),
  
  surgicalHistory: jsonb('surgical_history').$type<{
    procedure: string;
    year?: number;
    notes?: string;
  }[]>().default([]),
  
  familyHistory: jsonb('family_history').$type<{
    condition: string;
    relationship: string;
    notes?: string;
  }[]>().default([]),
  
  socialHistory: jsonb('social_history').$type<{
    tobaccoUse: 'never' | 'former' | 'current';
    tobaccoDetails?: string;
    alcoholUse: 'never' | 'occasional' | 'moderate' | 'heavy';
    alcoholDetails?: string;
    exerciseFrequency: 'none' | 'occasional' | 'regular' | 'daily';
    occupation?: string;
    livingSituation?: string;
  }>(),
  
  reviewOfSystems: jsonb('review_of_systems').$type<Record<string, string[]>>(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Patient goals
export const patientGoals = pgTable('patient_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  category: varchar('category', { length: 50 }).notNull(),
  goalText: text('goal_text').notNull(),
  targetValue: decimal('target_value', { precision: 10, scale: 2 }),
  targetUnit: varchar('target_unit', { length: 20 }),
  targetDate: date('target_date'),
  
  currentValue: decimal('current_value', { precision: 10, scale: 2 }),
  startValue: decimal('start_value', { precision: 10, scale: 2 }),
  
  status: varchar('status', { length: 20 }).default('active'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  achievedAt: timestamp('achieved_at'),
});
```

#### 3.2.4 Clinicians

```typescript
// src/schema/clinicians.ts
import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const clinicians = pgTable('clinicians', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Basic info
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  
  // Credentials
  title: varchar('title', { length: 50 }), // MD, DO, NP, PA, RN, etc.
  credentials: varchar('credentials', { length: 100 }),
  npiNumber: varchar('npi_number', { length: 10 }),
  licenseNumber: varchar('license_number', { length: 50 }),
  licenseState: varchar('license_state', { length: 2 }),
  
  // Specialties
  specialties: jsonb('specialties').$type<string[]>().default([]),
  
  // Bio & display
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  
  // Availability
  acceptingNewPatients: boolean('accepting_new_patients').default(true),
  
  // Schedule settings
  defaultAppointmentDuration: integer('default_appointment_duration').default(30),
  scheduleSettings: jsonb('schedule_settings').$type<{
    workingDays: number[];
    workingHoursStart: string;
    workingHoursEnd: string;
    lunchStart?: string;
    lunchEnd?: string;
    slotDuration: number;
  }>(),
  
  // Languages spoken (for patient matching)
  languagesSpoken: jsonb('languages_spoken').$type<string[]>().default(['en']),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Care coordinators
export const careCoordinators = pgTable('care_coordinators', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  
  supervisingClinicianId: uuid('supervising_clinician_id').references(() => clinicians.id),
  
  languagesSpoken: jsonb('languages_spoken').$type<string[]>().default(['en']),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```
