# Solopractice Results Sync - Implementation Summary

## ✅ What Was Implemented

### 1. Lab Results Webhook (`app/api/patient/results/route.ts`)
- **Endpoint**: `POST /api/patient/results`
- **Functionality**:
  - ✅ Validates webhook signature
  - ✅ Checks if patient is registered in MHA
  - ✅ Persists lab results to database
  - ✅ Translates doctor's notes to patient's preferred language
  - ✅ Parses follow-up instructions from doctor's notes
  - ✅ Automatically schedules follow-up appointments when needed
  - ✅ Handles both new results and updates to existing results

### 2. Radiology Results Webhook (`app/api/patient/radiology/route.ts`)
- **Endpoint**: `POST /api/patient/radiology`
- **Functionality**:
  - ✅ Validates webhook signature
  - ✅ Checks if patient is registered in MHA
  - ✅ Persists radiology results to database
  - ✅ Translates findings, impression, and recommendations
  - ✅ Parses follow-up instructions
  - ✅ Automatically schedules follow-up appointments when needed

### 3. Referral Response Webhook (`app/api/patient/referrals/route.ts`)
- **Endpoint**: `POST /api/patient/referrals`
- **Functionality**:
  - ✅ Validates webhook signature
  - ✅ Checks if patient is registered in MHA
  - ✅ Persists referral responses to database
  - ✅ Translates specialist notes
  - ✅ Parses follow-up instructions
  - ✅ Automatically schedules follow-up appointments when needed
  - ✅ Tracks scheduled appointments from specialists

### 4. Follow-up Scheduler (`lib/utils/followup-scheduler.ts`)
- **`parseFollowUpInstructions()`**: Parses doctor's notes to extract:
  - Follow-up keywords (follow-up, schedule, appointment, etc.)
  - Urgency level (routine, soon, urgent)
  - Appointment type (lab_review, medication, follow_up, etc.)
  - Time frame (weeks, months, days)
  - Telehealth preference
- **`scheduleFollowUpAppointment()`**: Creates appointment requests via Solopractice API

### 5. Database Schema (`supabase/migrations/005_add_results_tables.sql`)
- ✅ `lab_results` table with all necessary fields
- ✅ `radiology_results` table with findings, impression, recommendations
- ✅ `referral_responses` table with specialist information
- ✅ Indexes for efficient queries
- ✅ Support for Solopractice ID tracking

### 6. Results Queries (`lib/supabase/queries-results.ts`)
- ✅ `getPatientLabResults()` - Get all lab results for a patient
- ✅ `getLabResult()` - Get specific lab result
- ✅ `getPatientRadiologyResults()` - Get all radiology results
- ✅ `getRadiologyResult()` - Get specific radiology result
- ✅ `getPatientReferralResponses()` - Get all referral responses
- ✅ `getReferralResponse()` - Get specific referral response

### 7. Labs Page Updates (`app/labs/page.tsx`)
- ✅ Loads lab results from database instead of mock data
- ✅ Displays doctor's notes
- ✅ Shows result status and dates
- ✅ Handles loading and error states

## 🔌 Webhook Payload Formats

### Lab Results (`POST /api/patient/results`)
```typescript
{
  id: string; // Solopractice lab result ID
  patient_id: string;
  test_name: string;
  test_type?: string;
  result_date?: string; // YYYY-MM-DD
  status?: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  tests?: Array<{
    name: string;
    value?: string | number;
    unit?: string;
    reference?: string;
    flag?: 'normal' | 'high' | 'low' | 'critical';
  }>;
  messageToPatient?: string; // Doctor's note
  doctorNote?: string; // Alternative field name
  requiresFollowUp?: boolean; // Explicit flag
  attachmentUrl?: string; // PDF URL
  reviewedBy?: string;
  reviewedAt?: string;
}
```

### Radiology Results (`POST /api/patient/radiology`)
```typescript
{
  id: string; // Solopractice radiology ID
  patient_id: string;
  study_type?: string; // CT, MRI, X-Ray, Ultrasound
  study_name?: string;
  body_part?: string;
  result_date?: string;
  findings?: string;
  impression?: string;
  recommendation?: string; // Used for follow-up parsing
  messageToPatient?: string;
  doctorNote?: string;
  requiresFollowUp?: boolean;
  attachmentUrl?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
```

### Referral Responses (`POST /api/patient/referrals`)
```typescript
{
  id: string; // Solopractice referral ID
  patient_id: string;
  specialty?: string;
  specialist_name?: string;
  specialist_clinic?: string;
  status?: 'pending' | 'approved' | 'scheduled' | 'completed';
  appointment_date?: string; // If already scheduled
  appointment_time?: string;
  notes?: string;
  messageToPatient?: string;
  doctorNote?: string;
  requiresFollowUp?: boolean;
  response_date?: string;
}
```

## 🤖 Follow-up Scheduling Logic

### Automatic Detection
The system automatically detects follow-up needs from doctor's notes by looking for:
- Keywords: "follow up", "schedule", "appointment", "see patient again", etc.
- Urgency indicators: "urgent", "asap", "soon", "within week"
- Time frames: "2 weeks", "1 month", "3 months", etc.
- Appointment types: "lab review", "medication", "physical", etc.

### Appointment Creation
When follow-up is detected:
1. System parses doctor's note for instructions
2. Determines urgency (routine/soon/urgent)
3. Determines appointment type (lab_review/medication/follow_up/etc.)
4. Calculates suggested date from time frame
5. Creates appointment request via Solopractice API
6. Links appointment to the result (lab/radiology/referral)

### Example Doctor Notes That Trigger Follow-ups:
- "Schedule follow-up in 2 weeks to review lab results"
- "Patient should return in 1 month for medication adjustment"
- "Urgent follow-up needed within 1 week"
- "See patient again in 3 months for annual physical"

## 🔐 Security

- All webhook endpoints require `x-mha-signature` header
- Signature must match `INBOUND_WEBHOOK_SECRET` environment variable
- Patient must be registered in MHA (checked before processing)
- All database operations use Supabase service with proper permissions

## 🔄 Sync Flow

1. **Solopractice receives result** → Sends webhook to MHA
2. **MHA validates** → Checks signature and patient registration
3. **MHA persists** → Stores result in database
4. **MHA translates** → Translates doctor's notes to patient's language
5. **MHA parses follow-up** → Extracts follow-up instructions from notes
6. **MHA schedules** → Creates appointment request if follow-up needed
7. **MHA responds** → Returns success with result ID and appointment ID (if scheduled)

## 📊 Database Schema

### Lab Results Table
```sql
lab_results (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  solopractice_lab_id VARCHAR(255),
  test_name VARCHAR(255) NOT NULL,
  result_date DATE,
  status VARCHAR(50),
  results JSONB, -- Test results
  doctor_note TEXT, -- Translated note
  doctor_note_language VARCHAR(5),
  attachment_url VARCHAR(500),
  ...
)
```

### Radiology Results Table
```sql
radiology_results (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  solopractice_radiology_id VARCHAR(255),
  study_type VARCHAR(100),
  study_name VARCHAR(255),
  findings TEXT, -- Translated
  impression TEXT, -- Translated
  recommendation TEXT, -- Translated
  ...
)
```

### Referral Responses Table
```sql
referral_responses (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  solopractice_referral_id VARCHAR(255),
  specialty VARCHAR(255),
  specialist_name VARCHAR(255),
  status VARCHAR(50),
  appointment_date DATE,
  appointment_time TIME,
  notes TEXT, -- Translated
  ...
)
```

## 🚀 Deployment Checklist

Before deploying:

- [ ] Run migration `005_add_results_tables.sql` on Supabase
- [ ] Verify `INBOUND_WEBHOOK_SECRET` is set in environment
- [ ] Configure Solopractice to send webhooks:
  - Lab results → `/api/patient/results`
  - Radiology → `/api/patient/radiology`
  - Referrals → `/api/patient/referrals`
- [ ] Test webhook with sample data
- [ ] Verify patient registration check works
- [ ] Test result persistence
- [ ] Test translation of doctor's notes
- [ ] Test follow-up scheduling
- [ ] Verify results display correctly in UI
- [ ] Test appointment creation via Solopractice API

## 📝 Solopractice Integration Requirements

### Webhook Configuration
1. **Lab Results URL**: `https://your-mha-domain.com/api/patient/results`
2. **Radiology URL**: `https://your-mha-domain.com/api/patient/radiology`
3. **Referrals URL**: `https://your-mha-domain.com/api/patient/referrals`
4. **Method**: `POST`
5. **Headers**: 
   - `Content-Type: application/json`
   - `x-mha-signature: <INBOUND_WEBHOOK_SECRET>`

### When to Send Webhooks
- **Lab Results**: When results are finalized and reviewed by doctor
- **Radiology**: When radiology report is completed and reviewed
- **Referrals**: When referral is approved, scheduled, or specialist responds

### Required Data
- Always include: `id`, `patient_id`
- For follow-up scheduling: `doctorNote` or `messageToPatient` with follow-up instructions
- For translation: Include doctor's notes/messages (will be auto-translated)

## ✅ Status: COMPLETE AND WIRED

All components are implemented and ready:
- ✅ Lab results webhook with follow-up scheduling
- ✅ Radiology results webhook with follow-up scheduling
- ✅ Referral response webhook with follow-up scheduling
- ✅ Follow-up instruction parsing
- ✅ Automatic appointment creation
- ✅ Translation of doctor's notes
- ✅ Database schema for all result types
- ✅ Results queries for UI display
- ✅ Labs page loads from database
- ✅ All linter checks pass
- ✅ Follows canon rules

The system is ready to receive lab results, radiology results, and referral responses from Solopractice, automatically schedule follow-ups based on doctor's notes, and display them to patients in their preferred language.

