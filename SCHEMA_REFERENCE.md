# MyHealthAlly - Supabase Database Schema Reference

**Generated:** November 25, 2024  
**Source:** Actual database export  
**Status:** ✅ Models updated to match exact schema

---

## 📊 Complete Database Structure

### Table: `users`
Authentication and user management

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `email` | text | NO | - | Unique email |
| `password_hash` | text | NO | - | Hashed password |
| `role` | text | NO | - | "patient", "provider", "admin" |
| `clinic_id` | text | YES | - | FK to clinics |
| `patient_id` | text | YES | - | FK to patients (if role=patient) |
| `provider_id` | text | YES | - | FK to providers (if role=provider) |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

---

### Table: `patients`
Patient profiles and demographics

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `user_id` | text | NO | - | FK to users |
| `clinic_id` | text | NO | - | FK to clinics |
| `first_name` | text | YES | - | - |
| `last_name` | text | YES | - | - |
| `date_of_birth` | timestamp | YES | - | - |
| `demographics` | jsonb | YES | - | **Contains: phone, address, etc.** |
| `flags` | ARRAY | YES | - | **e.g., ["high_risk", "diabetic"]** |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

**Demographics structure example:**
```json
{
  "phone_number": "+1234567890",
  "address": "123 Main St",
  "emergency_contact": "Jane Doe +1987654321",
  "language_preference": "en",
  "insurance": "Blue Cross"
}
```

---

### Table: `providers`
Healthcare providers (doctors, nurses, MAs)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `user_id` | text | NO | - | FK to users |
| `clinic_id` | text | NO | - | FK to clinics |
| `first_name` | text | YES | - | - |
| `last_name` | text | YES | - | - |
| `specialty` | text | YES | - | e.g., "Family Medicine" |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

---

### Table: `clinics`
Multi-clinic support

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `name` | text | NO | - | Clinic name |
| `branding_config` | jsonb | YES | - | **Logo, colors, etc.** |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

**Branding config example:**
```json
{
  "logo_url": "https://...",
  "primary_color": "#00A7A0",
  "app_name": "MyHealthAlly"
}
```

---

### Table: `message_threads`
Conversation threads between patients and providers

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `patient_id` | text | NO | - | FK to patients |
| `clinic_id` | text | YES | - | FK to clinics |
| `participants` | jsonb | NO | - | **Array of user IDs** |
| `subject` | text | YES | - | Thread subject |
| `last_message_at` | timestamp | YES | - | Last activity |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

**Participants structure example:**
```json
{
  "user_ids": ["patient_user_id", "provider_user_id_1", "provider_user_id_2"]
}
```

---

### Table: `messages`
Individual messages in threads

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `thread_id` | text | NO | - | FK to message_threads |
| `sender_id` | text | NO | - | FK to users (who sent it) |
| `content` | text | NO | - | Message text or transcript |
| `attachments` | jsonb | YES | - | **Audio URLs, files, etc.** |
| `read` | boolean | NO | false | Read status |
| `read_at` | timestamp | YES | - | When marked read |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |

**Attachments structure for voice message:**
```json
{
  "audio_url": "https://storage.supabase.co/...",
  "duration_seconds": 45,
  "format": "m4a"
}
```

**Attachments structure for file:**
```json
{
  "file_url": "https://...",
  "file_name": "lab_results.pdf",
  "file_size": 1024000
}
```

---

### Table: `measurements`
Vital signs and health measurements

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `patient_id` | text | NO | - | FK to patients |
| `type` | text | NO | - | "blood_pressure", "weight", etc. |
| `value` | jsonb | NO | - | **Structured measurement data** |
| `timestamp` | timestamp | NO | - | When recorded |
| `source` | text | NO | - | "manual", "device", "healthkit" |
| `metadata` | jsonb | YES | - | **Notes, context, etc.** |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |

**Value structures by type:**

**Blood Pressure:**
```json
{
  "systolic": 120,
  "diastolic": 80,
  "unit": "mmHg"
}
```

**Weight:**
```json
{
  "value": 165.5,
  "unit": "lbs"
}
```

**Glucose:**
```json
{
  "value": 110,
  "unit": "mg/dL"
}
```

**Heart Rate:**
```json
{
  "value": 75,
  "unit": "bpm"
}
```

**Temperature:**
```json
{
  "value": 98.6,
  "unit": "F"
}
```

**Oxygen Saturation:**
```json
{
  "value": 98,
  "unit": "%"
}
```

---

### Table: `care_plans`
Patient care plans

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `patient_id` | text | NO | - | FK to patients |
| `phases` | jsonb | NO | - | **Care plan phases** |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

**Phases structure example:**
```json
{
  "phases": [
    {
      "name": "Phase 1: Stabilization",
      "start_date": "2024-01-01",
      "end_date": "2024-03-01",
      "goals": ["Reduce BP to <130/80", "Weight loss 10 lbs"],
      "interventions": ["Daily BP monitoring", "Low-sodium diet"]
    }
  ]
}
```

---

### Table: `alerts`
Patient alerts and notifications

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `patient_id` | text | NO | - | FK to patients |
| `severity` | text | NO | - | "critical", "warning", "info" |
| `type` | text | NO | - | Alert type/category |
| `title` | text | NO | - | Alert title |
| `body` | text | NO | - | Alert message |
| `payload` | jsonb | YES | - | **Additional data** |
| `status` | text | NO | 'ACTIVE' | "ACTIVE", "RESOLVED" |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `resolved_at` | timestamp | YES | - | When resolved |

---

### Table: `visit_requests`
Appointment requests from patients

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `patient_id` | text | NO | - | FK to patients |
| `type` | text | NO | - | Visit type |
| `status` | text | NO | 'PENDING' | "PENDING", "APPROVED", etc. |
| `requested_at` | timestamp | NO | CURRENT_TIMESTAMP | - |

---

### Table: `clinical_rules`
Clinical decision support rules

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `name` | text | NO | - | Rule name |
| `description` | text | YES | - | Description |
| `metric` | text | NO | - | What to measure |
| `windowDays` | integer | NO | 7 | Time window |
| `condition` | jsonb | NO | - | **Rule conditions** |
| `severity` | text | NO | - | Alert severity |
| `action` | text | NO | - | Action to take |
| `actionParams` | jsonb | YES | - | **Action parameters** |
| `enabled` | boolean | NO | true | Is rule active |
| `priority` | integer | NO | 0 | Rule priority |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |
| `updated_at` | timestamp | NO | - | - |

---

### Table: `rule_executions`
Log of clinical rule executions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `rule_id` | text | NO | - | FK to clinical_rules |
| `patient_id` | text | NO | - | FK to patients |
| `triggered` | boolean | NO | false | Did rule trigger |
| `result` | jsonb | YES | - | **Execution result** |
| `executed_at` | timestamp | NO | CURRENT_TIMESTAMP | - |

---

### Table: `refresh_tokens`
JWT refresh token management

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | text | NO | - | Primary key |
| `user_id` | text | NO | - | FK to users |
| `token` | text | NO | - | Refresh token |
| `expires_at` | timestamp | NO | - | Expiration |
| `created_at` | timestamp | NO | CURRENT_TIMESTAMP | - |

---

## 🔗 Relationships

```
users
  ├─> patients (one user can be one patient)
  ├─> providers (one user can be one provider)
  └─> refresh_tokens (one user, many tokens)

patients
  ├─> clinics (many patients to one clinic)
  ├─> measurements (one patient, many measurements)
  ├─> message_threads (one patient, many threads)
  ├─> care_plans (one patient, many care plans)
  ├─> alerts (one patient, many alerts)
  └─> visit_requests (one patient, many requests)

providers
  └─> clinics (many providers to one clinic)

message_threads
  ├─> patients (many threads to one patient)
  ├─> clinics (many threads to one clinic)
  └─> messages (one thread, many messages)

messages
  ├─> message_threads (many messages to one thread)
  └─> users (sender_id FK)

clinical_rules
  └─> rule_executions (one rule, many executions)
```

---

## 💡 Important Notes

### JSONB Fields:
- **Flexible structure** - can contain any valid JSON
- **Queryable** - Supabase/PostgreSQL can query inside JSONB
- **Extensible** - add new fields without schema changes

### Text IDs:
- All IDs are `text` type (not UUID)
- Likely using nanoid or similar
- Always non-nullable

### Timestamps:
- All `created_at` default to `CURRENT_TIMESTAMP`
- No timezone information (`timestamp without time zone`)
- Store as ISO string or Unix timestamp

### Arrays:
- `patients.flags` is an ARRAY type
- Can contain multiple string values
- Useful for tags/labels

---

## 🔐 Security Considerations

⚠️ **All tables currently show "Unrestricted"**  
- No Row Level Security (RLS) enabled
- Anyone with anon key can access data
- **MUST enable RLS before production**

### Recommended RLS Policies:

**Patients can only see their own data:**
```sql
CREATE POLICY "Patients can view own data"
ON patients FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

**Providers can see patients in their clinic:**
```sql
CREATE POLICY "Providers can view clinic patients"
ON patients FOR SELECT
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id FROM providers
    WHERE user_id = auth.uid()
  )
);
```

---

## 📝 Usage in Android App

All Kotlin models in `SupabaseModels.kt` match this schema exactly.

### Example: Creating a blood pressure measurement:

```kotlin
val measurementsRepo = MeasurementsRepository()

measurementsRepo.recordBloodPressure(
    patientId = "patient_123",
    systolic = 120,
    diastolic = 80,
    notes = "Feeling good today"
)

// This creates a measurement with:
// type = "blood_pressure"
// value = {"systolic": 120, "diastolic": 80, "unit": "mmHg"}
// metadata = {"notes": "Feeling good today"}
```

### Example: Sending a voice message:

```kotlin
val messagesRepo = MessagesRepository(context)

messagesRepo.sendVoiceMessage(
    threadId = "thread_456",
    senderId = "user_789",  // Current user's ID
    audioFile = recordedFile,
    durationSeconds = 45,
    transcript = "I'm feeling better today"
)

// This creates a message with:
// attachments = {
//   "audio_url": "https://...",
//   "duration_seconds": 45,
//   "format": "m4a"
// }
```

---

**Last Updated:** November 25, 2024  
**Status:** Complete and accurate  
**Source:** Direct database export
