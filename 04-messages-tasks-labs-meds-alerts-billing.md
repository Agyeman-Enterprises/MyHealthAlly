#### 3.2.8 Messages

```typescript
// src/schema/messages.ts
import { pgTable, uuid, text, varchar, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { patients } from './patients';
import { messageTypeEnum, messagePriorityEnum, languageEnum } from './enums';

export const messageThreads = pgTable('message_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  subject: varchar('subject', { length: 255 }),
  
  status: varchar('status', { length: 20 }).default('open'),
  priority: messagePriorityEnum('priority').default('normal'),
  
  // Red flag detection
  hasRedFlag: boolean('has_red_flag').default(false),
  redFlagReason: varchar('red_flag_reason', { length: 255 }),
  redFlagAcknowledgedAt: timestamp('red_flag_acknowledged_at'),
  redFlagAcknowledgedByUserId: uuid('red_flag_acknowledged_by_user_id').references(() => users.id),
  
  lastMessageAt: timestamp('last_message_at'),
  lastMessagePreview: varchar('last_message_preview', { length: 255 }),
  
  patientUnreadCount: integer('patient_unread_count').default(0),
  clinicianUnreadCount: integer('clinician_unread_count').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  patientIdx: index('message_threads_patient_idx').on(table.patientId),
  lastMessageIdx: index('message_threads_last_message_idx').on(table.lastMessageAt),
}));

export const messageThreadParticipants = pgTable('message_thread_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => messageThreads.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  role: varchar('role', { length: 20 }).notNull(),
  
  lastReadAt: timestamp('last_read_at'),
  
  notificationsEnabled: boolean('notifications_enabled').default(true),
  
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  leftAt: timestamp('left_at'),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => messageThreads.id, { onDelete: 'cascade' }),
  
  senderUserId: uuid('sender_user_id').notNull().references(() => users.id),
  senderRole: varchar('sender_role', { length: 20 }).notNull(),
  
  type: messageTypeEnum('type').notNull().default('text'),
  
  // Text content (original language)
  content: text('content'),
  contentLanguage: languageEnum('content_language').default('en'),
  
  // TRANSLATIONS - KEY FOR i18n
  translations: jsonb('translations').$type<Record<string, string>>().default({}),
  
  // Voice message
  voiceUrl: varchar('voice_url', { length: 500 }),
  voiceDurationSeconds: integer('voice_duration_seconds'),
  voiceTranscript: text('voice_transcript'),
  voiceTranscriptLanguage: languageEnum('voice_transcript_language'),
  
  // Attachments
  attachments: jsonb('attachments').$type<{
    type: 'image' | 'document';
    url: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
  }[]>().default([]),
  
  sentAt: timestamp('sent_at').notNull().defaultNow(),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at'),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at'),
  
  hasRedFlag: boolean('has_red_flag').default(false),
  redFlagType: varchar('red_flag_type', { length: 50 }),
  
  replyToMessageId: uuid('reply_to_message_id'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  threadSentIdx: index('messages_thread_sent_idx').on(table.threadId, table.sentAt),
  senderIdx: index('messages_sender_idx').on(table.senderUserId),
}));

// System message templates (for automated messages)
export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  
  // Content in multiple languages - KEY FOR i18n
  contentByLanguage: jsonb('content_by_language').$type<Record<string, string>>().notNull(),
  
  variables: jsonb('variables').$type<string[]>().default([]),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 3.2.9 Tasks

```typescript
// src/schema/tasks.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { patients } from './patients';
import { encounters } from './encounters';
import { carePlans, carePlanItems } from './care-plans';
import { taskStatusEnum, taskPriorityEnum, taskCategoryEnum, billingCodeTypeEnum } from './enums';

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  assigneeUserId: uuid('assignee_user_id').notNull().references(() => users.id),
  assigneeRole: varchar('assignee_role', { length: 20 }).notNull(),
  
  createdByUserId: uuid('created_by_user_id').references(() => users.id),
  
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  category: taskCategoryEnum('category').notNull(),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  
  status: taskStatusEnum('status').notNull().default('pending'),
  
  dueAt: timestamp('due_at'),
  reminderAt: timestamp('reminder_at'),
  
  completedAt: timestamp('completed_at'),
  completedByUserId: uuid('completed_by_user_id').references(() => users.id),
  completionNotes: text('completion_notes'),
  
  encounterId: uuid('encounter_id').references(() => encounters.id),
  carePlanId: uuid('care_plan_id').references(() => carePlans.id),
  carePlanItemId: uuid('care_plan_item_id').references(() => carePlanItems.id),
  
  isRecurring: boolean('is_recurring').default(false),
  recurrenceRule: jsonb('recurrence_rule').$type<{
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
  }>(),
  parentTaskId: uuid('parent_task_id'),
  
  // RPM/CCM billing tracking - CRITICAL
  isBillable: boolean('is_billable').default(false),
  billingCodeType: billingCodeTypeEnum('billing_code_type'),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  assigneeStatusIdx: index('tasks_assignee_status_idx').on(table.assigneeUserId, table.status),
  patientIdx: index('tasks_patient_idx').on(table.patientId),
  dueAtIdx: index('tasks_due_at_idx').on(table.dueAt),
}));

export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  content: text('content').notNull(),
  
  timeAddedSeconds: integer('time_added_seconds').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 3.2.10 Labs

```typescript
// src/schema/labs.ts
import { pgTable, uuid, varchar, text, date, timestamp, boolean, decimal, jsonb, index, integer } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { clinicians } from './clinicians';
import { encounters } from './encounters';
import { labStatusEnum } from './enums';

export const labOrders = pgTable('lab_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  orderingClinicianId: uuid('ordering_clinician_id').notNull().references(() => clinicians.id),
  encounterId: uuid('encounter_id').references(() => encounters.id),
  
  orderNumber: varchar('order_number', { length: 50 }),
  orderedAt: timestamp('ordered_at').notNull().defaultNow(),
  
  labFacility: varchar('lab_facility', { length: 255 }),
  labFacilityAddress: text('lab_facility_address'),
  
  status: labStatusEnum('status').notNull().default('ordered'),
  
  scheduledDate: date('scheduled_date'),
  collectionDate: date('collection_date'),
  
  resultedAt: timestamp('resulted_at'),
  resultsDocumentUrl: varchar('results_document_url', { length: 500 }),
  
  reviewedByClinicianId: uuid('reviewed_by_clinician_id').references(() => clinicians.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  
  // Patient visible notes (TRANSLATED)
  patientNotes: text('patient_notes'),
  patientNotesLanguage: varchar('patient_notes_language', { length: 5 }).default('en'),
  
  fastingRequired: boolean('fasting_required').default(false),
  fastingHours: integer('fasting_hours'),
  
  specialInstructions: text('special_instructions'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  patientIdx: index('lab_orders_patient_idx').on(table.patientId),
  statusIdx: index('lab_orders_status_idx').on(table.status),
}));

export const labTests = pgTable('lab_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  labOrderId: uuid('lab_order_id').notNull().references(() => labOrders.id, { onDelete: 'cascade' }),
  
  testCode: varchar('test_code', { length: 50 }).notNull(),
  testName: varchar('test_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  
  resultValue: varchar('result_value', { length: 100 }),
  resultUnit: varchar('result_unit', { length: 50 }),
  resultNumeric: decimal('result_numeric', { precision: 15, scale: 5 }),
  
  referenceRangeLow: decimal('reference_range_low', { precision: 15, scale: 5 }),
  referenceRangeHigh: decimal('reference_range_high', { precision: 15, scale: 5 }),
  referenceRangeText: varchar('reference_range_text', { length: 100 }),
  
  isAbnormal: boolean('is_abnormal').default(false),
  abnormalFlag: varchar('abnormal_flag', { length: 10 }),
  isCritical: boolean('is_critical').default(false),
  
  // Interpretation (TRANSLATED for patient)
  interpretation: text('interpretation'),
  interpretationLanguage: varchar('interpretation_language', { length: 5 }).default('en'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const labResultHistory = pgTable('lab_result_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  testCode: varchar('test_code', { length: 50 }).notNull(),
  testName: varchar('test_name', { length: 255 }).notNull(),
  
  resultNumeric: decimal('result_numeric', { precision: 15, scale: 5 }),
  resultUnit: varchar('result_unit', { length: 50 }),
  
  collectionDate: date('collection_date').notNull(),
  labTestId: uuid('lab_test_id').references(() => labTests.id),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  patientTestIdx: index('lab_result_history_patient_test_idx').on(table.patientId, table.testCode),
  collectionDateIdx: index('lab_result_history_collection_date_idx').on(table.collectionDate),
}));
```

#### 3.2.11 Medications

```typescript
// src/schema/medications.ts
import { pgTable, uuid, varchar, text, date, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { clinicians } from './clinicians';
import { encounters } from './encounters';

export const medications = pgTable('medications', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  prescriberId: uuid('prescriber_id').references(() => clinicians.id),
  encounterId: uuid('encounter_id').references(() => encounters.id),
  
  name: varchar('name', { length: 255 }).notNull(),
  genericName: varchar('generic_name', { length: 255 }),
  brandName: varchar('brand_name', { length: 255 }),
  
  ndcCode: varchar('ndc_code', { length: 20 }),
  
  dosage: varchar('dosage', { length: 100 }).notNull(),
  dosageUnit: varchar('dosage_unit', { length: 50 }).notNull(),
  frequency: varchar('frequency', { length: 100 }).notNull(),
  route: varchar('route', { length: 50 }),
  
  schedule: jsonb('schedule').$type<{
    times?: string[];
    withFood?: boolean;
    beforeBed?: boolean;
    asNeeded?: boolean;
    maxDaily?: number;
  }>(),
  
  startDate: date('start_date'),
  endDate: date('end_date'),
  
  isActive: boolean('is_active').default(true),
  isPRN: boolean('is_prn').default(false),
  
  refillsRemaining: integer('refills_remaining'),
  lastRefillDate: date('last_refill_date'),
  pharmacy: varchar('pharmacy', { length: 255 }),
  pharmacyPhone: varchar('pharmacy_phone', { length: 20 }),
  
  // Instructions (TRANSLATED for patient)
  instructions: text('instructions'),
  instructionsLanguage: varchar('instructions_language', { length: 5 }).default('en'),
  
  indication: text('indication'),
  
  discontinuedAt: timestamp('discontinued_at'),
  discontinuedByClinicianId: uuid('discontinued_by_clinician_id').references(() => clinicians.id),
  discontinuedReason: text('discontinued_reason'),
  
  clinicianNotes: text('clinician_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const medicationAdherence = pgTable('medication_adherence', {
  id: uuid('id').primaryKey().defaultRandom(),
  medicationId: uuid('medication_id').notNull().references(() => medications.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  scheduledAt: timestamp('scheduled_at').notNull(),
  
  takenAt: timestamp('taken_at'),
  taken: boolean('taken').default(false),
  
  skipped: boolean('skipped').default(false),
  skipReason: varchar('skip_reason', { length: 255 }),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const refillRequests = pgTable('refill_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  medicationId: uuid('medication_id').notNull().references(() => medications.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  urgency: varchar('urgency', { length: 20 }).default('routine'),
  notes: text('notes'),
  
  status: varchar('status', { length: 30 }).default('pending'),
  
  respondedAt: timestamp('responded_at'),
  respondedByClinicianId: uuid('responded_by_clinician_id').references(() => clinicians.id),
  responseNotes: text('response_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 3.2.12 Alerts & Rules Engine

```typescript
// src/schema/alerts.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, index, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { patients } from './patients';
import { clinicians } from './clinicians';
import { vitals } from './vitals';
import { alertSeverityEnum, alertStatusEnum } from './enums';

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  type: varchar('type', { length: 50 }).notNull(),
  
  severity: alertSeverityEnum('severity').notNull(),
  status: alertStatusEnum('status').notNull().default('active'),
  
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  ruleId: uuid('rule_id').references(() => alertRules.id),
  ruleName: varchar('rule_name', { length: 100 }),
  
  triggerData: jsonb('trigger_data').$type<{
    vitalId?: string;
    vitalType?: string;
    vitalValue?: number;
    threshold?: number;
  }>(),
  
  vitalId: uuid('vital_id').references(() => vitals.id),
  
  assignedToUserId: uuid('assigned_to_user_id').references(() => users.id),
  assignedToClinicianId: uuid('assigned_to_clinician_id').references(() => clinicians.id),
  
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedByUserId: uuid('acknowledged_by_user_id').references(() => users.id),
  acknowledgmentNotes: text('acknowledgment_notes'),
  
  resolvedAt: timestamp('resolved_at'),
  resolvedByUserId: uuid('resolved_by_user_id').references(() => users.id),
  resolutionNotes: text('resolution_notes'),
  resolutionAction: varchar('resolution_action', { length: 100 }),
  
  notificationsSent: jsonb('notifications_sent').$type<{
    channel: string;
    sentAt: string;
    recipient: string;
  }[]>().default([]),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  patientStatusIdx: index('alerts_patient_status_idx').on(table.patientId, table.status),
  severityIdx: index('alerts_severity_idx').on(table.severity),
  createdAtIdx: index('alerts_created_at_idx').on(table.createdAt),
}));

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  
  ruleType: varchar('rule_type', { length: 50 }).notNull(),
  conditions: jsonb('conditions').$type<{
    vitalType?: string;
    operator?: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'between';
    value?: number;
    valueMin?: number;
    valueMax?: number;
    duration?: number;
    count?: number;
    timeWindow?: number;
  }>().notNull(),
  
  alertSeverity: alertSeverityEnum('alert_severity').notNull(),
  alertTitle: varchar('alert_title', { length: 255 }).notNull(),
  alertMessageTemplate: text('alert_message_template').notNull(),
  
  actions: jsonb('actions').$type<{
    notifyPatient?: boolean;
    notifyClinician?: boolean;
    createTask?: boolean;
    taskAssignee?: 'clinician' | 'care_coordinator';
    escalateAfterMinutes?: number;
  }>().default({}),
  
  appliesToAllPatients: boolean('applies_to_all_patients').default(true),
  patientIds: jsonb('patient_ids').$type<string[]>(),
  
  isActive: boolean('is_active').default(true),
  
  cooldownMinutes: integer('cooldown_minutes').default(60),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 3.2.13 Billing & Time Tracking

```typescript
// src/schema/billing.ts
import { pgTable, uuid, varchar, text, date, timestamp, integer, decimal, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { users } from './users';
import { encounters } from './encounters';
import { tasks } from './tasks';
import { billingCodeTypeEnum } from './enums';

// Billable time entries (for RPM/CCM) - CRITICAL FOR BILLING
export const billableTimeEntries = pgTable('billable_time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  codeType: billingCodeTypeEnum('code_type').notNull(),
  
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  durationSeconds: integer('duration_seconds').notNull(),
  
  activityType: varchar('activity_type', { length: 100 }).notNull(),
  description: text('description'),
  
  encounterId: uuid('encounter_id').references(() => encounters.id),
  taskId: uuid('task_id').references(() => tasks.id),
  
  billingPeriodStart: date('billing_period_start').notNull(),
  billingPeriodEnd: date('billing_period_end').notNull(),
  
  status: varchar('status', { length: 30 }).default('pending'),
  
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  patientPeriodIdx: index('billable_time_patient_period_idx').on(table.patientId, table.billingPeriodStart),
  codeTypeIdx: index('billable_time_code_type_idx').on(table.codeType),
}));

// Monthly billing summaries
export const billingPeriodSummaries = pgTable('billing_period_summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  
  // RPM metrics
  rpmDaysWithReadings: integer('rpm_days_with_readings').default(0),
  rpmTotalReadings: integer('rpm_total_readings').default(0),
  rpmTimeSeconds: integer('rpm_time_seconds').default(0),
  rpmEligible: boolean('rpm_eligible').default(false),
  
  // CCM metrics
  ccmTimeSeconds: integer('ccm_time_seconds').default(0),
  ccmEligible: boolean('ccm_eligible').default(false),
  
  codesEarned: jsonb('codes_earned').$type<{
    code: string;
    units: number;
    amount?: number;
  }[]>().default([]),
  
  status: varchar('status', { length: 30 }).default('draft'),
  
  submittedAt: timestamp('submitted_at'),
  submittedByUserId: uuid('submitted_by_user_id').references(() => users.id),
  
  paidAt: timestamp('paid_at'),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  patientPeriodIdx: index('billing_summary_patient_period_idx').on(table.patientId, table.periodStart),
}));

// Patient billing
export const patientBilling = pgTable('patient_billing', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }).unique(),
  
  currentBalance: decimal('current_balance', { precision: 10, scale: 2 }).default('0'),
  
  defaultPaymentMethodId: varchar('default_payment_method_id', { length: 100 }),
  
  autopayEnabled: boolean('autopay_enabled').default(false),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const patientPayments = pgTable('patient_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentMethodLast4: varchar('payment_method_last4', { length: 4 }),
  
  status: varchar('status', { length: 30 }).default('pending'),
  
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
  
  description: text('description'),
  
  processedAt: timestamp('processed_at'),
  failedAt: timestamp('failed_at'),
  failureReason: text('failure_reason'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```
