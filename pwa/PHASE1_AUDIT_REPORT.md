# PHASE 1 AUDIT REPORT - Practice Attachment Model

**Date:** 2025-01-02  
**Status:** ✅ Complete (Read-Only Analysis)

---

## 1. USER AUTH + PROFILE LOADING

### Primary Auth Store
**Location:** `lib/store/auth-store.ts`

- **Zustand store** with persistence
- `signInWithSupabase()` loads patient ID from `users` table join with `patients`
- User interface includes:
  - `patientId?: string | null` (for patient users)
  - `practiceId?: string | null` (for provider users)
  - **NO attachment status field currently**

### Profile Loading Functions
**Locations:**
- `lib/supabase/queries-settings.ts` - `getCurrentUserAndPatient()`
- `lib/supabase/auth.ts` - `getCurrentUser()`, `getSession()`
- Various pages load patientId on mount (vitals, symptom-check, hospital-admission)

### Current Behavior
- On signup: Creates `users` record + `patients` record immediately
- On login: Loads patient ID from database join
- **Assumption:** Patient record always exists after signup

---

## 2. PRACTICE / PATIENT ASSUMPTIONS

### Patient Record Creation
**Location:** `app/auth/signup/page.tsx` (lines 125-136)

```typescript
// Create patient record
const { error: patientError } = await supabase
  .from('patients')
  .insert({
    user_id: userRecord.id,
    first_name: formData.firstName,
    last_name: formData.lastName,
    date_of_birth: formData.dateOfBirth || null,
    phone: formData.phone || null,
  });
```

**Finding:** Patient record is created **immediately on signup**, before any practice attachment.

### Practice Assumptions
- `practiceId` exists in User interface but **only used for providers**
- No `practice_id` or `clinic_id` on `patients` table (checked schema)
- No practice attachment concept for patients
- Many pages assume `patientId` exists and fail gracefully if not

### Database Schema
**Location:** `supabase/migrations/001_initial_schema.sql`

- `patients` table has:
  - `primary_clinician_id` (UUID, nullable)
  - **NO `practice_id` or `clinic_id` column**
  - **NO attachment status fields**

---

## 3. SOLOPRACTICE PATIENT CREATION

### Current SP API Usage
**Location:** `lib/api/solopractice-client.ts`

**API Calls Found:**
- `apiClient.getThreads()` - Gets message threads (may auto-create)
- `apiClient.sendMessage()` - Sends messages
- `apiClient.getThreadMessages()` - Gets thread messages
- `apiClient.recordMeasurement()` - Records vitals (creates alerts in SP)
- `apiClient.requestAppointment()` - Requests appointments

### SP Patient Creation
**Finding:** ❌ **NO EXPLICIT SP PATIENT CREATION FOUND**

- No `createPatient()` or `registerPatient()` function
- No call to SP patient registration endpoint
- Messages/vitals may implicitly create patient in SP, but not explicit

### Implicit Creation Points
1. **Messages:** First message may create thread/patient in SP
2. **Vitals:** `recordMeasurement()` may create patient if not exists
3. **Webhooks:** SP sends data to MHA, but MHA doesn't create patient in SP

**Conclusion:** SP patient creation is **implicit/automatic** or **doesn't happen yet**.

---

## 4. CLINICAL ROUTES / PAGES

### Clinical Modules (Require Practice Attachment)
1. **`/messages`** - Message threads with care team
   - Uses: `apiClient.getThreads()`, `apiClient.sendMessage()`
   - **Status:** Requires SP integration

2. **`/messages/[id]`** - Message thread detail
   - Uses: `apiClient.getThreadMessages()`
   - **Status:** Requires SP integration

3. **`/messages/new`** - New message
   - Uses: `sendMessageToSolopractice()`
   - **Status:** Requires SP integration

4. **`/labs`** - Lab results
   - Uses: `getPatientLabResults()` from Supabase
   - Receives webhooks from SP: `/api/patient/results`
   - **Status:** Requires SP integration

5. **`/labs/[id]`** - Lab result detail
   - **Status:** Requires SP integration

6. **`/medications`** - Medications list
   - Uses: `getPatientMedications()` from Supabase
   - Receives webhooks from SP: `/api/patient/medications`
   - **Status:** Requires SP integration

7. **`/medications/refill`** - Medication refill request
   - **Status:** Requires SP integration

8. **`/appointments`** - Appointments list
   - **Status:** Requires SP integration

9. **`/appointments/request`** - Request appointment
   - Uses: `apiClient.requestAppointment()`
   - **Status:** Requires SP integration

10. **`/appointments/calendar`** - Appointment calendar
    - **Status:** Requires SP integration

11. **`/care-plan`** - Care plan view
    - Uses: `getPatientCarePlans()` from Supabase
    - **Status:** Requires SP integration

12. **`/symptom-check`** - Symptom checker
    - Uses: `createSymptomCheckWithTask()` - creates task for clinician
    - **Status:** Requires SP integration

13. **`/vitals`** - Vitals entry
    - Uses: `apiClient.recordMeasurement()` - sends to SP
    - **Status:** Requires SP integration (for sending to care team)

14. **`/referrals`** - Referrals
    - Receives webhooks from SP: `/api/patient/referrals`
    - **Status:** Requires SP integration

15. **`/referrals/request`** - Request referral
    - **Status:** Requires SP integration

16. **`/billing`** - Billing/payments
    - **Status:** Requires SP integration

17. **`/hospital-admission`** - Hospital admission notification
    - Creates record and notifies clinician
    - **Status:** Requires SP integration

### Non-Clinical Routes (Should Work Unattached)
1. **`/education`** - Educational content
   - **Status:** Should work unattached

2. **`/vitals`** - Vitals entry (viewing/calculating only)
   - **Status:** Can work unattached if not sending to SP

3. **BMI Calculator** - Not found as separate route
   - **Status:** May be part of vitals or separate tool

4. **Nutrition** - Not found in routes
   - **Status:** May not exist yet (placeholder screens mentioned)

5. **Exercise** - Not found in routes
   - **Status:** May not exist yet (placeholder screens mentioned)

6. **Resources** - Not found in routes
   - **Status:** May not exist yet (placeholder screens mentioned)

---

## 5. DEFAULT PRACTICE ASSIGNMENT

### Search Results
**Finding:** ✅ **NO DEFAULT PRACTICE ASSIGNMENT FOUND**

- No automatic Ohimaa assignment
- No default `practice_id` on patient creation
- Only reference to "Ohimaa" is in `app/settings/contact/page.tsx` as display text:
  ```typescript
  <p className="text-gray-600">Ohimaa GU Functional Medicine</p>
  ```

**Conclusion:** No default practice assignment exists. New users are created without practice attachment.

---

## 6. SUMMARY FINDINGS

### ✅ What Exists
- User auth store with patient ID loading
- Patient record creation on signup
- SP API client with various endpoints
- Clinical modules that use SP integration
- Webhook endpoints for SP → MHA data sync

### ❌ What's Missing
- **No practice attachment model**
- **No attachment status tracking**
- **No explicit SP patient creation**
- **No practice_id on patients table**
- **No gating for clinical modules**
- **No connect flow**

### 🔍 Key Assumptions Found
1. Patient record always exists after signup
2. Patient ID is always available for clinical modules
3. SP patient may be created implicitly on first API call
4. No distinction between "attached" and "unattached" users

---

## 7. RECOMMENDATIONS FOR PHASE 2

### Database Changes Needed
1. Add to `patients` table:
   - `practice_id` (UUID, nullable, FK to practices/clinics)
   - `attachment_status` (enum: 'UNATTACHED' | 'REQUESTED' | 'ATTACHED')
   - `sp_patient_id` (VARCHAR, nullable) - SP patient ID after attachment
   - `attachment_requested_at` (TIMESTAMP, nullable)
   - `attached_at` (TIMESTAMP, nullable)

2. Create `practice_attachment_requests` table (optional):
   - For tracking attachment requests/invites

### Code Changes Needed
1. **Auth Store:** Add attachment fields to User interface
2. **Signup Flow:** Don't create patient record immediately (or create with UNATTACHED status)
3. **RequirePractice Gate:** Wrap clinical routes
4. **Connect Flow:** New pages for practice attachment
5. **SP Patient Creation:** Centralize in `attachPractice()` utility
6. **Migration:** Map existing patients to ATTACHED status

---

## 8. RISK ASSESSMENT

### Breaking Changes Risk: **MEDIUM**
- Existing users have patient records
- Need to migrate existing users to ATTACHED status
- Clinical modules may break if patientId is null

### Migration Strategy
1. Add new columns with defaults
2. Set all existing patients to `attachment_status = 'ATTACHED'`
3. Set `practice_id = NULL` for now (can be populated later)
4. New users get `attachment_status = 'UNATTACHED'`

---

**END OF AUDIT REPORT**

