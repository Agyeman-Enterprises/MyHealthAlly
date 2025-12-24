#### 3.2.5 Vitals

```typescript
// src/schema/vitals.ts
import { pgTable, uuid, decimal, varchar, timestamp, boolean, integer, jsonb, index, text } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { clinicians } from './clinicians';
import { vitalTypeEnum, vitalSourceEnum } from './enums';

export const vitals = pgTable('vitals', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  // Vital type
  type: vitalTypeEnum('type').notNull(),
  
  // Values (flexible for different vital types)
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  valueSecondary: decimal('value_secondary', { precision: 10, scale: 2 }), // e.g., diastolic for BP
  unit: varchar('unit', { length: 20 }).notNull(),
  
  // Source tracking
  source: vitalSourceEnum('source').notNull().default('manual'),
  deviceId: varchar('device_id', { length: 100 }),
  
  // Timestamp of measurement (not when recorded)
  measuredAt: timestamp('measured_at').notNull(),
  
  // RPM tracking - CRITICAL FOR BILLING
  rpmEligible: boolean('rpm_eligible').default(false),
  rpmTransmitted: boolean('rpm_transmitted').default(false),
  rpmTransmittedAt: timestamp('rpm_transmitted_at'),
  
  // Notes
  notes: text('notes'),
  
  // Flags
  isAbnormal: boolean('is_abnormal').default(false),
  abnormalReason: varchar('abnormal_reason', { length: 255 }),
  
  // Review status
  reviewedByClinicianId: uuid('reviewed_by_clinician_id').references(() => clinicians.id),
  reviewedAt: timestamp('reviewed_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  patientTypeIdx: index('vitals_patient_type_idx').on(table.patientId, table.type),
  measuredAtIdx: index('vitals_measured_at_idx').on(table.measuredAt),
  patientMeasuredIdx: index('vitals_patient_measured_idx').on(table.patientId, table.measuredAt),
}));

// Blood pressure specific
export const bloodPressureReadings = pgTable('blood_pressure_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  vitalId: uuid('vital_id').notNull().references(() => vitals.id, { onDelete: 'cascade' }).unique(),
  
  systolic: integer('systolic').notNull(),
  diastolic: integer('diastolic').notNull(),
  pulse: integer('pulse'),
  
  position: varchar('position', { length: 20 }), // sitting, standing, lying
  arm: varchar('arm', { length: 10 }), // left, right
  cuffSize: varchar('cuff_size', { length: 20 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// HRV readings (detailed)
export const hrvReadings = pgTable('hrv_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  vitalId: uuid('vital_id').notNull().references(() => vitals.id, { onDelete: 'cascade' }).unique(),
  
  rmssd: decimal('rmssd', { precision: 10, scale: 2 }).notNull(),
  sdnn: decimal('sdnn', { precision: 10, scale: 2 }),
  
  readinessScore: integer('readiness_score'), // 0-100
  recoveryScore: integer('recovery_score'), // 0-100
  stressLevel: integer('stress_level'), // 0-100
  
  sleepQuality: integer('sleep_quality'), // 1-5
  activityLevel: varchar('activity_level', { length: 20 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Weight/BMI readings - FIRST CLASS FOR GLP-1
export const weightReadings = pgTable('weight_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  vitalId: uuid('vital_id').notNull().references(() => vitals.id, { onDelete: 'cascade' }).unique(),
  
  weightLbs: decimal('weight_lbs', { precision: 6, scale: 2 }).notNull(),
  bmi: decimal('bmi', { precision: 5, scale: 2 }),
  
  // Body composition (from smart scale)
  bodyFatPercent: decimal('body_fat_percent', { precision: 5, scale: 2 }),
  muscleMassLbs: decimal('muscle_mass_lbs', { precision: 6, scale: 2 }),
  waterPercent: decimal('water_percent', { precision: 5, scale: 2 }),
  boneMassLbs: decimal('bone_mass_lbs', { precision: 5, scale: 2 }),
  
  clothed: boolean('clothed').default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Glucose readings
export const glucoseReadings = pgTable('glucose_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  vitalId: uuid('vital_id').notNull().references(() => vitals.id, { onDelete: 'cascade' }).unique(),
  
  value: integer('value').notNull(), // mg/dL
  
  context: varchar('context', { length: 30 }), // fasting, before_meal, after_meal, bedtime, random
  mealType: varchar('meal_type', { length: 20 }),
  minutesSinceMeal: integer('minutes_since_meal'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Vital thresholds per patient (personalized ranges)
export const vitalThresholds = pgTable('vital_thresholds', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  vitalType: vitalTypeEnum('vital_type').notNull(),
  
  lowCritical: decimal('low_critical', { precision: 10, scale: 2 }),
  lowWarning: decimal('low_warning', { precision: 10, scale: 2 }),
  normalMin: decimal('normal_min', { precision: 10, scale: 2 }),
  normalMax: decimal('normal_max', { precision: 10, scale: 2 }),
  highWarning: decimal('high_warning', { precision: 10, scale: 2 }),
  highCritical: decimal('high_critical', { precision: 10, scale: 2 }),
  
  lowCriticalSecondary: decimal('low_critical_secondary', { precision: 10, scale: 2 }),
  highCriticalSecondary: decimal('high_critical_secondary', { precision: 10, scale: 2 }),
  
  setByClinicianId: uuid('set_by_clinician_id').references(() => clinicians.id),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 3.2.6 Care Plans

```typescript
// src/schema/care-plans.ts
import { pgTable, uuid, varchar, text, integer, date, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { clinicians } from './clinicians';
import { carePlanStatusEnum, carePlanSectionTypeEnum } from './enums';

export const carePlans = pgTable('care_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  clinicianId: uuid('clinician_id').notNull().references(() => clinicians.id),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  status: carePlanStatusEnum('status').notNull().default('draft'),
  
  startDate: date('start_date'),
  endDate: date('end_date'),
  reviewDate: date('review_date'),
  
  version: integer('version').notNull().default(1),
  parentPlanId: uuid('parent_plan_id'),
  
  primaryGoals: jsonb('primary_goals').$type<string[]>().default([]),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  activatedAt: timestamp('activated_at'),
  completedAt: timestamp('completed_at'),
});

export const carePlanSections = pgTable('care_plan_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  carePlanId: uuid('care_plan_id').notNull().references(() => carePlans.id, { onDelete: 'cascade' }),
  
  type: carePlanSectionTypeEnum('type').notNull(),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  instructions: text('instructions'),
  
  sortOrder: integer('sort_order').notNull().default(0),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const carePlanItems = pgTable('care_plan_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sectionId: uuid('section_id').notNull().references(() => carePlanSections.id, { onDelete: 'cascade' }),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  frequency: varchar('frequency', { length: 50 }),
  schedule: jsonb('schedule').$type<{
    times?: string[];
    days?: number[];
    instructions?: string;
  }>(),
  
  dosage: varchar('dosage', { length: 100 }),
  dosageUnit: varchar('dosage_unit', { length: 50 }),
  
  durationWeeks: integer('duration_weeks'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  
  requiresTracking: boolean('requires_tracking').default(false),
  trackingType: varchar('tracking_type', { length: 50 }),
  
  sortOrder: integer('sort_order').notNull().default(0),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Patient progress on care plan items
export const carePlanProgress = pgTable('care_plan_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').notNull().references(() => carePlanItems.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  completedAt: timestamp('completed_at').notNull(),
  value: varchar('value', { length: 255 }),
  notes: text('notes'),
  photoUrl: varchar('photo_url', { length: 500 }),
  
  skipped: boolean('skipped').default(false),
  skipReason: varchar('skip_reason', { length: 255 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 3.2.7 Encounters (Visits)

```typescript
// src/schema/encounters.ts
import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { clinicians } from './clinicians';
import { users } from './users';
import { encounterTypeEnum, encounterStatusEnum } from './enums';

export const encounters = pgTable('encounters', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  clinicianId: uuid('clinician_id').notNull().references(() => clinicians.id),
  
  type: encounterTypeEnum('type').notNull(),
  status: encounterStatusEnum('status').notNull().default('scheduled'),
  
  scheduledAt: timestamp('scheduled_at').notNull(),
  scheduledDurationMinutes: integer('scheduled_duration_minutes').notNull().default(30),
  
  checkedInAt: timestamp('checked_in_at'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  
  isVirtual: boolean('is_virtual').default(false),
  location: varchar('location', { length: 255 }),
  meetingLink: varchar('meeting_link', { length: 500 }),
  
  chiefComplaint: text('chief_complaint'),
  reasonForVisit: text('reason_for_visit'),
  
  // SOAP notes
  subjective: text('subjective'),
  objective: text('objective'),
  assessment: text('assessment'),
  plan: text('plan'),
  
  additionalNotes: text('additional_notes'),
  
  // Patient instructions (WILL BE TRANSLATED)
  patientInstructions: text('patient_instructions'),
  patientInstructionsLanguage: varchar('patient_instructions_language', { length: 5 }).default('en'),
  
  followUpRequired: boolean('follow_up_required').default(false),
  followUpWeeks: integer('follow_up_weeks'),
  followUpNotes: text('follow_up_notes'),
  
  billingCodes: jsonb('billing_codes').$type<string[]>().default([]),
  
  // CCM time tracking
  ccmTimeSeconds: integer('ccm_time_seconds').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Encounter orders
export const encounterOrders = pgTable('encounter_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id').notNull().references(() => encounters.id, { onDelete: 'cascade' }),
  
  orderType: varchar('order_type', { length: 50 }).notNull(),
  
  orderCode: varchar('order_code', { length: 50 }),
  orderName: varchar('order_name', { length: 255 }).notNull(),
  description: text('description'),
  
  priority: varchar('priority', { length: 20 }).default('routine'),
  
  status: varchar('status', { length: 30 }).default('ordered'),
  
  instructions: text('instructions'),
  
  referralSpecialty: varchar('referral_specialty', { length: 100 }),
  referralReason: text('referral_reason'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Walk-in requests
export const walkInRequests = pgTable('walk_in_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  reason: text('reason').notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  
  preferredClinicianId: uuid('preferred_clinician_id').references(() => clinicians.id),
  preferredTimeStart: timestamp('preferred_time_start'),
  preferredTimeEnd: timestamp('preferred_time_end'),
  
  status: varchar('status', { length: 30 }).default('pending'),
  
  encounterId: uuid('encounter_id').references(() => encounters.id),
  
  responseNotes: text('response_notes'),
  respondedAt: timestamp('responded_at'),
  respondedByUserId: uuid('responded_by_user_id').references(() => users.id),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```
