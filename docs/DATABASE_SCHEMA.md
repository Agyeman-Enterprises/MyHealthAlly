# MyHealthAlly Database Schema

This document describes the complete Prisma database schema with all models, relations, and field types.

## Overview

The database uses PostgreSQL and is managed through Prisma ORM. All models use UUIDs (v4) or CUIDs as primary keys.

---

## Models

### User

Represents a user account in the system. Can be a patient, provider, medical assistant, or admin.

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         String   // PATIENT, PROVIDER, MEDICAL_ASSISTANT, ADMIN
  clinicId     String?  @map("clinic_id")
  patientId    String?  @unique @map("patient_id")
  providerId   String?  @unique @map("provider_id")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  clinic        Clinic?        @relation(fields: [clinicId], references: [id])
  patient       Patient?       @relation("PatientToUser")
  provider      Provider?      @relation("ProviderToUser")
  refreshTokens RefreshToken[]

  @@map("users")
}
```

**Fields:**
- `id`: Unique user identifier (UUID)
- `email`: User email (unique)
- `passwordHash`: Bcrypt hashed password
- `role`: User role (PATIENT, PROVIDER, MEDICAL_ASSISTANT, ADMIN)
- `clinicId`: Optional clinic association
- `patientId`: Optional patient record link (if role is PATIENT)
- `providerId`: Optional provider record link (if role is PROVIDER)

---

### Clinic

Represents a healthcare clinic or organization.

```prisma
model Clinic {
  id             String   @id @default(uuid())
  name           String
  brandingConfig Json?    @map("branding_config")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  users     User[]
  patients  Patient[]
  providers Provider[]

  @@map("clinics")
}
```

**Fields:**
- `id`: Unique clinic identifier
- `name`: Clinic name
- `brandingConfig`: JSON object for clinic branding settings

---

### Patient

Represents a patient record linked to a user account.

```prisma
model Patient {
  id           String    @id @default(uuid())
  userId       String    @unique @map("user_id")
  clinicId     String    @map("clinic_id")
  firstName    String?   @map("first_name")
  lastName     String?   @map("last_name")
  dateOfBirth  DateTime? @map("date_of_birth")
  heightCm     Float?    @map("height_cm")
  demographics Json?
  flags        String[]
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user            User              @relation("PatientToUser", fields: [userId], references: [id])
  clinic          Clinic            @relation(fields: [clinicId], references: [id])
  measurements    Measurement[]
  carePlans       CarePlan[]
  alerts          Alert[]
  visitRequests   VisitRequest[]
  visits          Visit[]
  ruleExecutions  RuleExecution[]
  messageThreads  MessageThread[]
  weeklySummaries WeeklySummary[]
  devices         DeviceConnection[]
  vitals          VitalReading[]
  hrvReadings     HRVReading[]
  bmiReadings     BMIReading[]

  @@map("patients")
}
```

**Fields:**
- `id`: Unique patient identifier
- `userId`: One-to-one link to User account
- `clinicId`: Associated clinic
- `firstName`, `lastName`: Patient name
- `dateOfBirth`: Date of birth
- `heightCm`: Height in centimeters (for BMI calculation)
- `demographics`: JSON object for additional demographic data
- `flags`: Array of string flags (e.g., "HIGH_RISK", "RPM_ENROLLED")

---

### Provider

Represents a healthcare provider (doctor, nurse, etc.).

```prisma
model Provider {
  id             String   @id @default(cuid())
  name           String
  specialties    String[]
  telemedEnabled Boolean  @default(true)
  userId         String?  @unique @map("user_id")
  clinicId       String?  @map("clinic_id")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user         User?                  @relation("ProviderToUser", fields: [userId], references: [id])
  clinic       Clinic?                @relation(fields: [clinicId], references: [id])
  availability ProviderAvailability[]
  slots        VisitSlot[]
  visits       Visit[]

  @@map("providers")
}
```

**Fields:**
- `id`: Unique provider identifier (CUID)
- `name`: Provider name
- `specialties`: Array of specialty strings
- `telemedEnabled`: Whether provider can do virtual visits
- `userId`: Optional link to User account
- `clinicId`: Associated clinic

---

### Measurement

Represents a health measurement (blood pressure, glucose, weight, etc.).

```prisma
model Measurement {
  id        String   @id @default(uuid())
  patientId String   @map("patient_id")
  type      String   // BLOOD_PRESSURE, GLUCOSE, WEIGHT, etc.
  value     Json     // Can be number or object (e.g., {systolic: 120, diastolic: 80})
  timestamp DateTime
  source    String   // "HEALTHKIT", "MANUAL", "DEVICE"
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, timestamp])
  @@index([patientId, type, timestamp])
  @@map("measurements")
}
```

**Fields:**
- `id`: Unique measurement identifier
- `patientId`: Associated patient
- `type`: Measurement type (BLOOD_PRESSURE, GLUCOSE, WEIGHT, SLEEP, STEPS, MOOD, etc.)
- `value`: JSON value (number or object depending on type)
- `timestamp`: When measurement was taken
- `source`: Source of measurement (HEALTHKIT, MANUAL, DEVICE)
- `metadata`: Additional metadata JSON

---

### CarePlan

Represents a patient's care plan with phases and tasks.

```prisma
model CarePlan {
  id        String   @id @default(uuid())
  patientId String   @map("patient_id")
  phases    Json     // Array of CarePlanPhase
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@map("care_plans")
}
```

**Fields:**
- `id`: Unique care plan identifier
- `patientId`: Associated patient
- `phases`: JSON array of care plan phases, each containing:
  - `name`: Phase name
  - `durationWeeks`: Duration in weeks
  - `tasks`: Array of tasks with `id`, `title`, `description`, `frequency`, `completed`

---

### Alert

Represents a health alert for a patient.

```prisma
model Alert {
  id         String    @id @default(uuid())
  patientId  String    @map("patient_id")
  severity   String    // INFO, WARNING, CRITICAL
  type       String    // BP_HIGH_TREND, GLUCOSE_HIGH, etc.
  title      String
  body       String
  payload    Json?
  status     String    @default("ACTIVE") // ACTIVE, RESOLVED, DISMISSED
  createdAt  DateTime  @default(now()) @map("created_at")
  resolvedAt DateTime? @map("resolved_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, status])
  @@index([status, createdAt])
  @@map("alerts")
}
```

**Fields:**
- `id`: Unique alert identifier
- `patientId`: Associated patient
- `severity`: Alert severity (INFO, WARNING, CRITICAL)
- `type`: Alert type (BP_HIGH_TREND, GLUCOSE_HIGH, MISSED_READING, etc.)
- `title`: Alert title
- `body`: Alert message body
- `payload`: Optional JSON payload with additional data
- `status`: Alert status (ACTIVE, RESOLVED, DISMISSED)
- `resolvedAt`: When alert was resolved (if resolved)

---

### VisitRequest

Represents a patient's request for a visit (walk-in or scheduled).

```prisma
model VisitRequest {
  id             String        @id @default(cuid())
  patientId      String        @map("patient_id")
  requestType    RequestType
  visitMode      VisitMode
  requestedDate  DateTime?     @map("requested_date")
  windowStart    DateTime?     @map("window_start")
  windowEnd      DateTime?     @map("window_end")
  reasonText     String        @map("reason_text")
  reasonCategory String?       @map("reason_category")
  severity       SeverityLevel @default(GREEN)
  status         RequestStatus @default(NEW)
  proposedSlotId String?       @map("proposed_slot_id")
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, status])
  @@index([status, createdAt])
  @@map("visit_requests")
}
```

**Fields:**
- `id`: Unique visit request identifier (CUID)
- `patientId`: Associated patient
- `requestType`: WALK_IN or SCHEDULED
- `visitMode`: VIRTUAL or IN_PERSON
- `requestedDate`: Preferred date (for scheduled requests)
- `windowStart`, `windowEnd`: Time window (for scheduled requests)
- `reasonText`: Reason for visit
- `reasonCategory`: Optional category
- `severity`: Severity level (GREEN, YELLOW, ORANGE, RED)
- `status`: Request status (see RequestStatus enum)
- `proposedSlotId`: Optional proposed slot ID

---

### VisitSlot

Represents an available time slot for a visit.

```prisma
model VisitSlot {
  id         String     @id @default(cuid())
  providerId String     @map("provider_id")
  provider   Provider   @relation(fields: [providerId], references: [id], onDelete: Cascade)
  startTime  DateTime   @map("start_time")
  endTime    DateTime   @map("end_time")
  visitMode  VisitMode  @map("visit_mode")
  status     SlotStatus @default(FREE)
  heldUntil  DateTime?  @map("held_until")
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")

  visit Visit?

  @@index([providerId, startTime])
  @@index([status, startTime])
  @@index([heldUntil])
  @@map("visit_slots")
}
```

**Fields:**
- `id`: Unique slot identifier (CUID)
- `providerId`: Associated provider
- `startTime`, `endTime`: Slot time range
- `visitMode`: VIRTUAL or IN_PERSON
- `status`: Slot status (FREE, HELD, BOOKED, BLOCKED)
- `heldUntil`: Expiry time for held slots

---

### Visit

Represents an actual visit (scheduled or walk-in).

```prisma
model Visit {
  id         String      @id @default(cuid())
  patientId  String      @map("patient_id")
  providerId String      @map("provider_id")
  slotId     String      @unique @map("slot_id")
  provider   Provider    @relation(fields: [providerId], references: [id], onDelete: Cascade)
  patient    Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  slot       VisitSlot   @relation(fields: [slotId], references: [id], onDelete: Cascade)
  visitType  VisitType   @map("visit_type")
  visitMode  VisitMode   @map("visit_mode")
  reasonText String      @map("reason_text")
  status     VisitStatus @default(PLANNED)
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  virtualSession VirtualVisitSession?

  @@index([patientId, status])
  @@index([providerId, status])
  @@index([status, createdAt])
  @@map("visits")
}
```

**Fields:**
- `id`: Unique visit identifier (CUID)
- `patientId`: Associated patient
- `providerId`: Associated provider
- `slotId`: Associated time slot (unique)
- `visitType`: WALK_IN or SCHEDULED
- `visitMode`: VIRTUAL or IN_PERSON
- `reasonText`: Reason for visit
- `status`: Visit status (see VisitStatus enum)

**State Machine:**
- `PLANNED` → `CHECKED_IN`, `CANCELLED`
- `CHECKED_IN` → `IN_PROGRESS`, `NO_SHOW`, `CANCELLED`
- `IN_PROGRESS` → `COMPLETED`, `CANCELLED`
- `COMPLETED` → (terminal)
- `CANCELLED` → (terminal)
- `NO_SHOW` → (terminal)

---

### VirtualVisitSession

Represents a virtual visit session (WebRTC/telehealth).

```prisma
model VirtualVisitSession {
  id               String        @id @default(cuid())
  visitId          String        @unique @map("visit_id")
  visit            Visit         @relation(fields: [visitId], references: [id], onDelete: Cascade)
  roomId           String        @map("room_id")
  status           TelemedStatus @default(NOT_STARTED)
  patientJoinedAt  DateTime?     @map("patient_joined_at")
  providerJoinedAt DateTime?     @map("provider_joined_at")
  endedAt          DateTime?     @map("ended_at")
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  @@index([roomId])
  @@index([status])
  @@map("virtual_visit_sessions")
}
```

**Fields:**
- `id`: Unique session identifier (CUID)
- `visitId`: Associated visit (one-to-one)
- `roomId`: Daily.co room ID (or other telehealth provider)
- `status`: Session status (NOT_STARTED, WAITING, ACTIVE, ENDED)
- `patientJoinedAt`, `providerJoinedAt`: Join timestamps
- `endedAt`: Session end timestamp

---

### DeviceConnection

Represents a connection to an external health device (Apple Watch, Oura, Fitbit, etc.).

```prisma
model DeviceConnection {
  id           String         @id @default(cuid())
  patientId    String         @map("patient_id")
  provider     DeviceProvider
  externalId   String         @map("external_id")
  accessToken  String         @map("access_token")
  refreshToken String?        @map("refresh_token")
  expiresAt    DateTime?      @map("expires_at")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@unique([patientId, provider, externalId])
  @@index([patientId])
  @@index([provider, externalId])
  @@map("device_connections")
}
```

**Fields:**
- `id`: Unique connection identifier (CUID)
- `patientId`: Associated patient
- `provider`: Device provider (APPLE, OURA, FITBIT, GARMIN, WITHINGS)
- `externalId`: User/device ID in provider's system
- `accessToken`: OAuth access token
- `refreshToken`: OAuth refresh token
- `expiresAt`: Token expiration time

---

### VitalReading

Represents a vital sign reading from a device.

```prisma
model VitalReading {
  id          String         @id @default(cuid())
  patientId   String         @map("patient_id")
  timestamp   DateTime
  source      DeviceProvider
  heartRate   Int?           @map("heart_rate")
  spo2        Int?
  respiration Int?
  systolicBP  Int?           @map("systolic_bp")
  diastolicBP Int?           @map("diastolic_bp")
  createdAt   DateTime       @default(now()) @map("created_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, timestamp])
  @@index([patientId, source, timestamp])
  @@map("vital_readings")
}
```

**Fields:**
- `id`: Unique reading identifier (CUID)
- `patientId`: Associated patient
- `timestamp`: When reading was taken
- `source`: Device provider (APPLE, OURA, FITBIT, GARMIN, WITHINGS)
- `heartRate`: Heart rate in bpm
- `spo2`: Blood oxygen saturation in %
- `respiration`: Respiration rate in breaths/min
- `systolicBP`, `diastolicBP`: Blood pressure in mmHg

---

### HRVReading

Represents a Heart Rate Variability (HRV) reading.

```prisma
model HRVReading {
  id          String         @id @default(cuid())
  patientId   String         @map("patient_id")
  timestamp   DateTime
  source      DeviceProvider
  rmssdMs     Float          @map("rmssd_ms")
  sdnnMs      Float?         @map("sdnn_ms")
  context     HRVContext     @default(UNKNOWN)
  createdAt   DateTime       @default(now()) @map("created_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, timestamp])
  @@index([patientId, source, timestamp])
  @@map("hrv_readings")
}
```

**Fields:**
- `id`: Unique reading identifier (CUID)
- `patientId`: Associated patient
- `timestamp`: When reading was taken
- `source`: Device provider
- `rmssdMs`: RMSSD value in milliseconds (normalized)
- `sdnnMs`: SDNN value in milliseconds (if available, e.g., from Apple)
- `context`: Reading context (SLEEP, REST, WORKOUT, UNKNOWN)

**Note:** Apple devices provide SDNN, which is normalized to RMSSD using approximation: `RMSSD ≈ SDNN * 0.85`

---

### BMIReading

Represents a BMI (Body Mass Index) reading.

```prisma
model BMIReading {
  id        String   @id @default(cuid())
  patientId String   @map("patient_id")
  timestamp DateTime @default(now())
  weightKg  Float    @map("weight_kg")
  heightCm  Float    @map("height_cm")
  bmi       Float
  createdAt DateTime @default(now()) @map("created_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, timestamp])
  @@map("bmi_readings")
}
```

**Fields:**
- `id`: Unique reading identifier (CUID)
- `patientId`: Associated patient
- `timestamp`: When reading was taken
- `weightKg`: Weight in kilograms
- `heightCm`: Height in centimeters
- `bmi`: Calculated BMI value

**BMI Formula:** `BMI = weightKg / (heightCm / 100)²`

**Critical for GLP-1 Medications:**
- BMI is essential for GLP-1 medication (e.g., Ozempic, Wegovy, Mounjaro) prescription eligibility
- BMI trends track weight loss progress on GLP-1 medications
- Typically requires BMI ≥ 30 (obesity) or BMI ≥ 27 with weight-related conditions
- Progress monitoring requires regular BMI tracking to assess medication effectiveness

---

### LabOrder

Represents a lab test order placed by a provider.

```prisma
model LabOrder {
  id          String      @id @default(cuid())
  patientId   String      @map("patient_id")
  visitId     String?     @map("visit_id")
  providerId  String      @map("provider_id")
  tests       String[]    // Array of test names/codes
  notes       String?
  status      LabOrderStatus @default(ORDERED)
  orderedAt   DateTime    @default(now()) @map("ordered_at")
  completedAt DateTime?   @map("completed_at")
  results     Json?       // Lab results when available
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  visit   Visit?  @relation(fields: [visitId], references: [id], onDelete: SetNull)

  @@index([patientId, status])
  @@index([providerId, status])
  @@index([status, orderedAt])
  @@map("lab_orders")
}
```

**Fields:**
- `id`: Unique lab order identifier (CUID)
- `patientId`: Associated patient
- `visitId`: Optional associated visit
- `providerId`: Ordering provider
- `tests`: Array of test names/codes (e.g., ["CBC", "CMP", "A1C", "Lipid Panel"])
- `notes`: Optional notes
- `status`: Order status (ORDERED, IN_PROGRESS, COMPLETED, CANCELLED)
- `orderedAt`: When order was placed
- `completedAt`: When results were received
- `results`: JSON object with lab results when available

---

### Referral

Represents a referral to a specialist or other provider.

```prisma
model Referral {
  id          String         @id @default(cuid())
  patientId   String         @map("patient_id")
  visitId     String?        @map("visit_id")
  providerId  String         @map("provider_id")
  specialty   String         // e.g., "Cardiology", "Endocrinology"
  reason      String
  priority    ReferralPriority @default(ROUTINE)
  status      ReferralStatus @default(PENDING)
  referredTo  String?        @map("referred_to")
  notes       String?
  sentAt      DateTime?      @map("sent_at")
  completedAt DateTime?      @map("completed_at")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  visit   Visit?  @relation(fields: [visitId], references: [id], onDelete: SetNull)

  @@index([patientId, status])
  @@index([providerId, status])
  @@index([status, createdAt])
  @@map("referrals")
}
```

**Fields:**
- `id`: Unique referral identifier (CUID)
- `patientId`: Associated patient
- `visitId`: Optional associated visit
- `providerId`: Referring provider
- `specialty`: Specialty type (Cardiology, Endocrinology, Physical Therapy, etc.)
- `reason`: Reason for referral
- `priority`: Referral priority (ROUTINE, URGENT, STAT)
- `status`: Referral status (PENDING, SENT, ACCEPTED, COMPLETED, CANCELLED)
- `referredTo`: Name of provider/clinic being referred to
- `notes`: Optional notes
- `sentAt`: When referral was sent to patient
- `completedAt`: When referral was completed

---

### ExcuseNote

Represents a medical excuse note or work/school clearance document.

```prisma
model ExcuseNote {
  id          String          @id @default(cuid())
  patientId   String          @map("patient_id")
  visitId     String?         @map("visit_id")
  providerId  String          @map("provider_id")
  type        ExcuseNoteType
  startDate   DateTime        @map("start_date")
  endDate     DateTime        @map("end_date")
  reason      String
  restrictions String?        // e.g., "No heavy lifting", "Light duty only"
  status      ExcuseNoteStatus @default(DRAFT)
  sentAt      DateTime?       @map("sent_at")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  visit   Visit?  @relation(fields: [visitId], references: [id], onDelete: SetNull)

  @@index([patientId, status])
  @@index([providerId, status])
  @@index([status, createdAt])
  @@map("excuse_notes")
}
```

**Fields:**
- `id`: Unique excuse note identifier (CUID)
- `patientId`: Associated patient
- `visitId`: Optional associated visit
- `providerId`: Issuing provider
- `type`: Note type (WORK, SCHOOL, GENERAL)
- `startDate`, `endDate`: Date range for excuse/clearance
- `reason`: Medical reason for excuse
- `restrictions`: Optional activity restrictions
- `status`: Note status (DRAFT, SENT, EXPIRED)
- `sentAt`: When note was sent to patient

---

### MessageThread

Represents a message thread between patient and clinic staff.

```prisma
model MessageThread {
  id            String    @id @default(uuid())
  patientId     String    @map("patient_id")
  clinicId      String?   @map("clinic_id")
  participants  Json      // Array of user IDs
  subject       String?
  lastMessageAt DateTime? @map("last_message_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  patient  Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([patientId])
  @@index([clinicId])
  @@map("message_threads")
}
```

**Fields:**
- `id`: Unique thread identifier (UUID)
- `patientId`: Associated patient
- `clinicId`: Associated clinic
- `participants`: JSON array of user IDs in the thread
- `subject`: Optional thread subject
- `lastMessageAt`: Timestamp of last message

---

### Message

Represents a message within a thread.

```prisma
model Message {
  id          String    @id @default(uuid())
  threadId    String    @map("thread_id")
  senderId    String    @map("sender_id")
  content     String
  attachments Json?     // Array of { type, url, filename, size }
  read        Boolean   @default(false)
  readAt      DateTime? @map("read_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  thread MessageThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@index([threadId, createdAt])
  @@index([senderId])
  @@map("messages")
}
```

**Fields:**
- `id`: Unique message identifier (UUID)
- `threadId`: Associated thread
- `senderId`: User ID of sender
- `content`: Message text content
- `attachments`: JSON array of attachment objects
- `read`: Whether message has been read
- `readAt`: When message was read

---

### ClinicalRule

Represents a clinical rule for automated health monitoring.

```prisma
model ClinicalRule {
  id           String   @id @default(uuid())
  name         String
  description  String?
  metric       String   // bp, glucose, weight, sleep, hrv, a1c
  windowDays   Int      @default(7)
  condition    Json     // { op: '>' | '<' | 'trendUp' | 'trendDown' | 'missing', threshold?: number }
  severity     String   // info, warn, critical
  action       String   // alert, suggest_visit, assign_task, assign_content
  actionParams Json?    // Additional parameters for action
  enabled      Boolean  @default(true)
  priority     Int      @default(0) // Higher priority rules evaluated first
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  executions RuleExecution[]

  @@index([metric, enabled])
  @@index([enabled, priority])
  @@map("clinical_rules")
}
```

**Fields:**
- `id`: Unique rule identifier (UUID)
- `name`: Rule name
- `description`: Rule description
- `metric`: Health metric to monitor (bp, glucose, weight, sleep, hrv, a1c)
- `windowDays`: Time window in days for evaluation
- `condition`: JSON condition object with operator and optional threshold
- `severity`: Rule severity (info, warn, critical)
- `action`: Action to take when triggered (alert, suggest_visit, assign_task, assign_content)
- `actionParams`: Additional parameters for the action
- `enabled`: Whether rule is active
- `priority`: Evaluation priority (higher = evaluated first)

---

### RuleExecution

Represents an execution of a clinical rule.

```prisma
model RuleExecution {
  id         String   @id @default(uuid())
  ruleId     String   @map("rule_id")
  patientId  String   @map("patient_id")
  triggered  Boolean  @default(false)
  result     Json?    // Execution result details
  executedAt DateTime @default(now()) @map("executed_at")

  rule    ClinicalRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  patient Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId, executedAt])
  @@index([ruleId, executedAt])
  @@map("rule_executions")
}
```

**Fields:**
- `id`: Unique execution identifier (UUID)
- `ruleId`: Associated rule
- `patientId`: Associated patient
- `triggered`: Whether rule was triggered
- `result`: JSON object with execution details
- `executedAt`: When rule was executed

---

### ProviderAvailability

Represents a provider's availability schedule.

```prisma
model ProviderAvailability {
  id         String             @id @default(cuid())
  providerId String             @map("provider_id")
  provider   Provider           @relation(fields: [providerId], references: [id], onDelete: Cascade)
  date       DateTime?
  dayOfWeek  Int?               @map("day_of_week") // 0-6
  startTime  DateTime           @map("start_time")
  endTime    DateTime           @map("end_time")
  visitMode  VisitMode          @map("visit_mode")
  location   String?
  status     AvailabilityStatus @default(ACTIVE)
  createdAt  DateTime           @default(now()) @map("created_at")
  updatedAt  DateTime           @updatedAt @map("updated_at")

  @@index([providerId, status])
  @@map("provider_availability")
}
```

**Fields:**
- `id`: Unique availability identifier (CUID)
- `providerId`: Associated provider
- `date`: Specific date (if one-time availability)
- `dayOfWeek`: Day of week 0-6 (if recurring, 0=Sunday)
- `startTime`, `endTime`: Availability time range
- `visitMode`: VIRTUAL or IN_PERSON
- `location`: Optional location string
- `status`: ACTIVE or PAUSED

---

### WeeklySummary

Represents a weekly health summary for a patient.

```prisma
model WeeklySummary {
  id        String   @id @default(uuid())
  patientId String   @map("patient_id")
  weekStart DateTime @map("week_start")
  weekEnd   DateTime @map("week_end")
  summary   Json     // { bpTrend, glucoseTrend, weightTrend, steps, sleep, adherence, recommendations }
  createdAt DateTime @default(now()) @map("created_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@unique([patientId, weekStart])
  @@index([patientId, weekStart])
  @@map("weekly_summaries")
}
```

**Fields:**
- `id`: Unique summary identifier (UUID)
- `patientId`: Associated patient
- `weekStart`, `weekEnd`: Week date range
- `summary`: JSON object with weekly health data and recommendations

---

### RefreshToken

Represents a refresh token for JWT authentication.

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}
```

**Fields:**
- `id`: Unique token identifier (UUID)
- `userId`: Associated user
- `token`: Refresh token string (unique)
- `expiresAt`: Token expiration time

---

## Enums

### VisitMode
```prisma
enum VisitMode {
  VIRTUAL
  IN_PERSON
}
```

### VisitType
```prisma
enum VisitType {
  WALK_IN
  SCHEDULED
}
```

### RequestType
```prisma
enum RequestType {
  WALK_IN
  SCHEDULED
}
```

### SeverityLevel
```prisma
enum SeverityLevel {
  GREEN
  YELLOW
  ORANGE
  RED
}
```

### SlotStatus
```prisma
enum SlotStatus {
  FREE
  HELD
  BOOKED
  BLOCKED
}
```

### RequestStatus
```prisma
enum RequestStatus {
  NEW
  TRIAGED
  AWAITING_PATIENT_CONFIRMATION
  CONVERTED_TO_VISIT
  CANCELLED
}
```

### VisitStatus
```prisma
enum VisitStatus {
  PLANNED
  CHECKED_IN
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### TelemedStatus
```prisma
enum TelemedStatus {
  NOT_STARTED
  WAITING
  ACTIVE
  ENDED
}
```

### AvailabilityStatus
```prisma
enum AvailabilityStatus {
  ACTIVE
  PAUSED
}
```

### DeviceProvider
```prisma
enum DeviceProvider {
  APPLE
  OURA
  FITBIT
  GARMIN
  WITHINGS
}
```

### HRVContext
```prisma
enum HRVContext {
  SLEEP
  REST
  WORKOUT
  UNKNOWN
}
```

### LabOrderStatus
```prisma
enum LabOrderStatus {
  ORDERED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### ReferralPriority
```prisma
enum ReferralPriority {
  ROUTINE
  URGENT
  STAT
}
```

### ReferralStatus
```prisma
enum ReferralStatus {
  PENDING
  SENT
  ACCEPTED
  COMPLETED
  CANCELLED
}
```

### ExcuseNoteType
```prisma
enum ExcuseNoteType {
  WORK
  SCHOOL
  GENERAL
}
```

### ExcuseNoteStatus
```prisma
enum ExcuseNoteStatus {
  DRAFT
  SENT
  EXPIRED
}
```

---

## Indexes

The schema includes several indexes for performance:

- **Patient measurements**: Indexed on `(patientId, timestamp)` and `(patientId, type, timestamp)`
- **Alerts**: Indexed on `(patientId, status)` and `(status, createdAt)`
- **Visit requests**: Indexed on `(patientId, status)` and `(status, createdAt)`
- **Visit slots**: Indexed on `(providerId, startTime)`, `(status, startTime)`, and `(heldUntil)`
- **Visits**: Indexed on `(patientId, status)`, `(providerId, status)`, and `(status, createdAt)`
- **Vital/HRV readings**: Indexed on `(patientId, timestamp)` and `(patientId, source, timestamp)`
- **BMI readings**: Indexed on `(patientId, timestamp)`
- **Lab orders**: Indexed on `(patientId, status)`, `(providerId, status)`, and `(status, orderedAt)`
- **Referrals**: Indexed on `(patientId, status)`, `(providerId, status)`, and `(status, createdAt)`
- **Excuse notes**: Indexed on `(patientId, status)`, `(providerId, status)`, and `(status, createdAt)`
- **Messages**: Indexed on `(threadId, createdAt)` and `(senderId)`
- **Rule executions**: Indexed on `(patientId, executedAt)` and `(ruleId, executedAt)`

---

## Relationships

### One-to-One
- `User` ↔ `Patient` (via `userId`)
- `User` ↔ `Provider` (via `userId`)
- `Visit` ↔ `VirtualVisitSession` (via `visitId`)
- `Visit` ↔ `VisitSlot` (via `slotId`)

### One-to-Many
- `Clinic` → `User[]`, `Patient[]`, `Provider[]`
- `Patient` → `Measurement[]`, `CarePlan[]`, `Alert[]`, `VisitRequest[]`, `Visit[]`, etc.
- `Provider` → `ProviderAvailability[]`, `VisitSlot[]`, `Visit[]`
- `MessageThread` → `Message[]`
- `ClinicalRule` → `RuleExecution[]`

### Many-to-One
- All child models reference their parent via foreign keys with `onDelete: Cascade`

---

## Notes

1. **Cascade Deletes**: Most relationships use `onDelete: Cascade` to maintain referential integrity
2. **Timestamps**: All models include `createdAt` and `updatedAt` timestamps
3. **JSON Fields**: Several models use JSON fields for flexible data storage (demographics, phases, summary, etc.)
4. **UUIDs vs CUIDs**: Most models use UUIDs, but some use CUIDs (Provider, VisitRequest, VisitSlot, etc.)
5. **Indexes**: Strategic indexes are placed on frequently queried fields
6. **Unique Constraints**: Email, userId, providerId, and some composite keys are unique

