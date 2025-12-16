# MyHealth Ally - Solopractice Integration Guide
**Date:** December 2024  
**Status:** Integration Architecture  
**Principle:** MyHealth Ally is a thin client - all enforcement happens server-side

---

## 🎯 Core Principle

**MyHealth Ally is a thin client. All safety rules (CG rules R1-R12) and Red Team stops are enforced server-side in Solopractice, NOT in the mobile app.**

This ensures:
- ✅ Rules cannot be bypassed
- ✅ Single source of truth for enforcement
- ✅ Consistent behavior across all patient apps
- ✅ Auditability and legal defensibility

---

## 🔌 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MyHealth Ally (Android)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Voice        │  │ Messages     │  │ Vitals       │     │
│  │ Recording    │  │ List         │  │ Tracking     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  API Client    │                        │
│                    │  (Retrofit)    │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTPS
                             │ JWT Auth
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              Solopractice Backend (Next.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         /api/portal/* Endpoints                      │   │
│  │  - Authentication                                    │   │
│  │  - Rate Limiting                                     │   │
│  │  - Role-Based Access Control                         │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │     Enforcement Service (R1-R12)                     │   │
│  │  - Practice Hours (R1)                               │   │
│  │  - Emergency Intercept (R2)                          │   │
│  │  - After-Hours Deferral (R3)                         │   │
│  │  - Urgency Classification (R4)                       │   │
│  │  - Hard Escalation (R5)                              │   │
│  │  - Telehealth Failure (R6)                           │   │
│  │  - Refill Safety Gate (R7)                           │   │
│  │  - Discharge Reconciliation (R8)                     │   │
│  │  - AI Advisory Boundary (R9)                         │   │
│  │  - Patient Transparency (R10)                        │   │
│  │  - No Silent Failure (R11)                           │   │
│  │  - Enforcement Priority (R12)                        │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │         Database (Supabase)                          │   │
│  │  - Audit Logs                                        │   │
│  │  - Patient Data                                      │   │
│  │  - Messages                                          │   │
│  │  - Measurements                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📍 Integration Points

### 1. Authentication & Authorization

**MyHealth Ally → Solopractice**

**Endpoint:** `POST /api/portal/auth/activate`  
**Purpose:** Activate patient account and get JWT token

**Flow:**
1. Patient receives activation link/token
2. MyHealth Ally calls activation endpoint
3. Solopractice validates token and returns JWT
4. MyHealth Ally stores JWT securely (EncryptedSharedPreferences)
5. All subsequent requests include JWT in Authorization header

**CG Rules Applied:**
- None (authentication only)

**Red Team Stops:**
- ✅ Token validation
- ✅ Rate limiting
- ✅ Audit logging of activation

---

### 2. Voice Messages

**MyHealth Ally → Solopractice**

**Endpoint:** `POST /api/portal/messages/threads/[id]/messages`  
**Purpose:** Send voice message (or text message)

**Flow:**
1. Patient records voice message in MyHealth Ally
2. Audio file uploaded to Supabase Storage (via Solopractice)
3. MyHealth Ally calls message endpoint with:
   - `threadId`
   - `body`: transcript or placeholder text
   - `symptomScreen`: emergency symptom check results
   - `attachments`: audio file URL
4. Solopractice enforces R1, R2, R3:
   - **R1:** Check if practice is open
   - **R2:** Check for emergency symptoms → redirect to 911 if found
   - **R3:** Defer non-urgent messages if after hours
5. Solopractice creates message and work item
6. Returns response with status (sent, deferred, blocked)

**CG Rules Applied:**
- ✅ **R1:** Practice Hours Enforcement
- ✅ **R2:** After-Hours Emergency Intercept
- ✅ **R3:** After-Hours Non-Urgent Deferral

**Red Team Stops:**
- ✅ Emergency symptoms detected → message blocked, 911 redirect
- ✅ After-hours messages deferred → SLA starts at opening
- ✅ All actions audited
- ✅ Patient sees clear status (deferred vs sent)

**MyHealth Ally Implementation:**
```kotlin
// In VoiceRecordingScreen.kt
suspend fun sendVoiceMessage(
    threadId: String,
    audioFile: File,
    transcript: String?,
    symptomScreen: SymptomScreenResult
): Result<MessageResponse> {
    // 1. Upload audio to storage (via Solopractice API)
    val audioUrl = uploadAudio(audioFile)
    
    // 2. Call Solopractice message endpoint
    val response = apiClient.sendMessage(
        threadId = threadId,
        body = transcript ?: "Voice message",
        symptomScreen = symptomScreen.toMap(),
        attachments = mapOf("audio_url" to audioUrl)
    )
    
    // 3. Handle response
    when (response.status) {
        "sent" -> showSuccess()
        "deferred" -> showDeferred(response.nextOpenAt)
        "blocked" -> {
            if (response.action == "redirect_emergency") {
                showEmergencyRedirect()
            } else {
                showBlocked(response.message)
            }
        }
    }
}
```

---

### 3. Message List

**MyHealth Ally → Solopractice**

**Endpoint:** `GET /api/portal/messages/threads`  
**Purpose:** Get patient's message threads

**Endpoint:** `GET /api/portal/messages/threads/[id]`  
**Purpose:** Get messages in a thread

**Flow:**
1. MyHealth Ally calls threads endpoint
2. Solopractice returns threads (filtered by patient ID via RLS)
3. MyHealth Ally displays threads
4. When thread selected, call messages endpoint
5. Solopractice returns messages (filtered by patient ID)

**CG Rules Applied:**
- ✅ **R10:** Patient Transparency Logging (all access logged)

**Red Team Stops:**
- ✅ RLS ensures patients only see their own messages
- ✅ All access audited
- ✅ Timestamps match patient-visible times

**MyHealth Ally Implementation:**
```kotlin
// In MessagesRepository.kt
suspend fun getPatientThreads(): Result<List<MessageThread>> {
    // Call Solopractice API (not Supabase directly!)
    return apiClient.getThreads()
}

suspend fun getThreadMessages(threadId: String): Result<List<Message>> {
    return apiClient.getThreadMessages(threadId)
}
```

---

### 4. Medication Refill Requests

**MyHealth Ally → Solopractice**

**Endpoint:** `POST /api/portal/meds/refill-requests`  
**Purpose:** Request medication refill

**Flow:**
1. Patient selects medication in MyHealth Ally
2. MyHealth Ally calls refill request endpoint
3. Solopractice enforces **R7:** Refill Request Safety Gate
   - Checks if required labs are up to date
   - Checks if monitoring requirements met
   - Blocks if requirements unmet
4. Returns response (approved, blocked, needs_labs)

**CG Rules Applied:**
- ✅ **R7:** Refill Request Safety Gate

**Red Team Stops:**
- ✅ Unsafe refills blocked automatically
- ✅ Patient informed of required steps
- ✅ Provider notified if needed
- ✅ All decisions audited

**MyHealth Ally Implementation:**
```kotlin
// In MedicationsScreen.kt
suspend fun requestRefill(medicationId: String): Result<RefillResponse> {
    val response = apiClient.requestRefill(medicationId)
    
    when (response.status) {
        "approved" -> showSuccess()
        "blocked" -> {
            showBlocked(
                reason = response.reason,
                requiredLabs = response.requiredLabs
            )
        }
        "pending" -> showPending()
    }
}
```

---

### 5. Vital Signs / Measurements

**MyHealth Ally → Solopractice**

**Endpoint:** `POST /api/portal/measurements` (to be created)  
**Purpose:** Record vital signs

**Current:** MyHealth Ally writes directly to Supabase  
**Should Be:** MyHealth Ally calls Solopractice API

**Flow:**
1. Patient enters vitals in MyHealth Ally
2. MyHealth Ally calls Solopractice measurements endpoint
3. Solopractice validates and stores measurement
4. Solopractice checks for alerts (via R4: Urgency Classification)
5. Creates work item if alert threshold exceeded

**CG Rules Applied:**
- ✅ **R4:** Urgency Classification & SLA
- ✅ **R5:** Hard Escalation for Red Items (if vital is critical)

**Red Team Stops:**
- ✅ Critical vitals trigger immediate escalation
- ✅ All measurements audited
- ✅ Patient sees their own data only (RLS)

**MyHealth Ally Implementation:**
```kotlin
// In VitalsScreen.kt
suspend fun recordBloodPressure(
    systolic: Int,
    diastolic: Int
): Result<MeasurementResponse> {
    // Call Solopractice API (not Supabase directly!)
    return apiClient.recordMeasurement(
        type = "blood_pressure",
        value = mapOf(
            "systolic" to systolic,
            "diastolic" to diastolic,
            "unit" to "mmHg"
        )
    )
}
```

---

### 6. Appointment Booking

**MyHealth Ally → Solopractice**

**Endpoint:** `POST /api/portal/appointments/request` (to be created)  
**Purpose:** Request appointment

**Flow:**
1. Patient selects appointment type and time
2. MyHealth Ally calls appointment request endpoint
3. Solopractice validates:
   - Practice hours (R1)
   - Provider availability
   - Insurance verification
4. Creates appointment request (status: pending)
5. Returns confirmation

**CG Rules Applied:**
- ✅ **R1:** Practice Hours Enforcement
- ✅ **R4:** Urgency Classification (if urgent appointment)

**Red Team Stops:**
- ✅ Appointments only during practice hours
- ✅ Urgent appointments escalated
- ✅ All requests audited

---

## 🚨 Critical: What MyHealth Ally MUST NOT Do

### ❌ DO NOT Enforce Rules Client-Side

**WRONG:**
```kotlin
// ❌ DON'T DO THIS - Rules should be server-side only
fun canSendMessage(): Boolean {
    val currentHour = LocalTime.now().hour
    return currentHour >= 9 && currentHour <= 17  // ❌ Client-side rule
}
```

**RIGHT:**
```kotlin
// ✅ DO THIS - Always call server, let it enforce rules
suspend fun sendMessage(): Result<MessageResponse> {
    return apiClient.sendMessage(...)  // Server enforces R1, R2, R3
}
```

### ❌ DO NOT Bypass Solopractice APIs

**WRONG:**
```kotlin
// ❌ DON'T DO THIS - Direct Supabase access bypasses enforcement
suspend fun sendMessageDirect() {
    supabase.from("messages").insert(...)  // ❌ Bypasses R1, R2, R3
}
```

**RIGHT:**
```kotlin
// ✅ DO THIS - Always use Solopractice API
suspend fun sendMessage() {
    apiClient.sendMessage(...)  // Goes through enforcement
}
```

### ❌ DO NOT Store Enforcement Logic

**WRONG:**
```kotlin
// ❌ DON'T DO THIS - Rules belong in Solopractice
object MessageRules {
    fun isEmergency(text: String): Boolean {
        return text.contains("chest pain")  // ❌ Client-side rule
    }
}
```

**RIGHT:**
```kotlin
// ✅ DO THIS - Collect symptom screen, send to server
data class SymptomScreenResult(
    val hasChestPain: Boolean,
    val hasShortnessOfBreath: Boolean,
    // ... other symptoms
)

// Server decides if it's an emergency
```

---

## ✅ What MyHealth Ally SHOULD Do

### ✅ Collect Symptom Screen Data

Before sending after-hours messages, MyHealth Ally should:
1. Show symptom screen
2. Collect patient responses
3. Send `symptomScreen` data to Solopractice
4. Let Solopractice decide if it's an emergency (R2)

```kotlin
// In VoiceRecordingScreen.kt
@Composable
fun SymptomScreen(
    onComplete: (SymptomScreenResult) -> Unit
) {
    var hasChestPain by remember { mutableStateOf(false) }
    var hasShortnessOfBreath by remember { mutableStateOf(false) }
    // ... other symptoms
    
    Button(onClick = {
        onComplete(SymptomScreenResult(
            hasChestPain = hasChestPain,
            hasShortnessOfBreath = hasShortnessOfBreath,
            // ...
        ))
    }) {
        Text("Continue")
    }
}
```

### ✅ Display Server Responses

MyHealth Ally should display:
- **Deferred messages:** "Message received after hours. Will be reviewed at [time]."
- **Blocked messages:** Show reason (e.g., "Emergency symptoms detected. Please call 911.")
- **Practice hours:** Display practice hours from server response

```kotlin
// In MessageDetailScreen.kt
when (message.status) {
    "after_hours_deferred" -> {
        Text("Message received after hours")
        Text("Will be reviewed at ${message.nextOpenAt}")
    }
    "blocked" -> {
        Text("Message blocked: ${message.reason}")
        if (message.action == "redirect_emergency") {
            Button(onClick = { call911() }) {
                Text("Call 911")
            }
        }
    }
}
```

### ✅ Handle Error Responses

MyHealth Ally should handle:
- **403 Forbidden:** Rule blocked the action
- **429 Too Many Requests:** Rate limited
- **401 Unauthorized:** Token expired, re-authenticate

```kotlin
// In ApiClient.kt
suspend fun <T> handleResponse(response: Response<T>): Result<T> {
    return when (response.code()) {
        403 -> Result.failure(AppError.RuleBlocked(response.message()))
        429 -> Result.failure(AppError.RateLimited(response.retryAfter()))
        401 -> Result.failure(AppError.Unauthorized())
        else -> Result.success(response.body()!!)
    }
}
```

---

## 🔐 Authentication Flow

### Initial Setup

1. **Patient receives activation link** (email/SMS)
2. **MyHealth Ally opens activation link**
3. **Calls:** `POST /api/portal/auth/activate`
   ```json
   {
     "token": "activation_token_from_link"
   }
   ```
4. **Receives:**
   ```json
   {
     "access_token": "jwt_token",
     "refresh_token": "refresh_token",
     "patient_id": "patient_uuid",
     "practice_id": "practice_uuid"
   }
   ```
5. **Store tokens securely** (EncryptedSharedPreferences)
6. **Include in all requests:**
   ```
   Authorization: Bearer {access_token}
   ```

### Token Refresh

```kotlin
// In AuthRepository.kt
suspend fun refreshToken(): Result<String> {
    val refreshToken = pinManager.getRefreshToken()
    val response = apiClient.refreshToken(refreshToken)
    
    if (response.isSuccess) {
        pinManager.saveAuthToken(response.accessToken)
        pinManager.saveRefreshToken(response.refreshToken)
        return Result.success(response.accessToken)
    } else {
        // Refresh failed, need to re-authenticate
        return Result.failure(AppError.Unauthorized())
    }
}
```

---

## 📊 API Endpoints Summary

| Feature | Endpoint | Method | CG Rules | Red Team Stops |
|---------|----------|--------|----------|----------------|
| **Activate Account** | `/api/portal/auth/activate` | POST | None | Token validation, audit |
| **Get Threads** | `/api/portal/messages/threads` | GET | R10 | RLS, audit |
| **Get Messages** | `/api/portal/messages/threads/[id]` | GET | R10 | RLS, audit |
| **Send Message** | `/api/portal/messages/threads/[id]/messages` | POST | R1, R2, R3 | Emergency intercept, deferral |
| **Request Refill** | `/api/portal/meds/refill-requests` | POST | R7 | Safety gate, audit |
| **Get Medications** | `/api/portal/meds` | GET | R10 | RLS, audit |
| **Record Measurement** | `/api/portal/measurements` | POST | R4, R5 | Urgency, escalation |
| **Request Appointment** | `/api/portal/appointments/request` | POST | R1, R4 | Hours, urgency |

---

## 🎯 Red Team Stops Implementation

### Stop 1: Emergency Messages After Hours

**Requirement:** "Can it prove a patient was redirected to ED/911 when appropriate?"

**Implementation:**
- MyHealth Ally collects symptom screen
- Sends to Solopractice with message
- Solopractice R2 detects emergency → blocks message
- Returns `403` with `action: "redirect_emergency"`
- MyHealth Ally shows 911 redirect UI
- **Audit log created** in Solopractice

**Proof:**
- Audit log shows: `rule: "R2", action: "block", reason: "emergency_symptoms"`
- Patient sees redirect message
- Message never enters queue

### Stop 2: After-Hours Message Handling

**Requirement:** "Are after-hours messages clearly labeled to patients?"

**Implementation:**
- MyHealth Ally sends message after hours
- Solopractice R1 detects closed → R3 defers
- Returns `200` with `status: "after_hours_deferred", nextOpenAt: "..."`
- MyHealth Ally displays: "Message received after hours. Will be reviewed at [time]."
- **Audit log created** with deferral timestamp

**Proof:**
- Message has `status: "after_hours_deferred"`
- Patient sees clear message about review time
- SLA starts at `nextOpenAt` (not message time)

### Stop 3: Unsafe Refills Blocked

**Requirement:** "Can refills occur without required labs?"

**Implementation:**
- Patient requests refill in MyHealth Ally
- Solopractice R7 checks lab requirements
- If labs missing → blocks refill
- Returns `403` with `reason: "required_labs_missing", requiredLabs: [...]`
- MyHealth Ally shows: "Refill blocked. Please complete: [labs]"
- **Audit log created**

**Proof:**
- Audit log shows: `rule: "R7", action: "block", reason: "required_labs_missing"`
- Patient sees clear reason
- Refill cannot proceed until labs completed

### Stop 4: Critical Vitals Escalated

**Requirement:** "Are red-flag events escalated automatically and auditable?"

**Implementation:**
- Patient records critical BP (e.g., 180/120)
- MyHealth Ally sends to Solopractice
- Solopractice R4 classifies as "red" urgency
- R5 triggers hard escalation (SMS/pager to provider)
- Returns `200` with `urgency: "red", escalated: true`
- **Audit log created** with escalation timestamp

**Proof:**
- Measurement has `urgency: "red"`
- Work item created with `due_at: +15 minutes`
- Escalation logged in audit
- Provider notified within 15 minutes

---

## 📋 Implementation Checklist

### Phase 1: API Client Setup
- [ ] Create Retrofit API client for Solopractice
- [ ] Implement authentication (JWT token management)
- [ ] Implement token refresh
- [ ] Add error handling for 403, 429, 401
- [ ] Add request/response logging

### Phase 2: Message Integration
- [ ] Replace direct Supabase calls with Solopractice API
- [ ] Implement symptom screen collection
- [ ] Handle deferred message responses
- [ ] Handle blocked message responses
- [ ] Display practice hours from server

### Phase 3: Medication Integration
- [ ] Replace direct Supabase calls with Solopractice API
- [ ] Handle refill request responses
- [ ] Display blocked refill reasons
- [ ] Show required labs when blocked

### Phase 4: Measurements Integration
- [ ] Replace direct Supabase calls with Solopractice API
- [ ] Handle urgency responses
- [ ] Display escalation notifications
- [ ] Show critical vital alerts

### Phase 5: Testing
- [ ] Test after-hours message flow
- [ ] Test emergency symptom detection
- [ ] Test refill blocking
- [ ] Test critical vital escalation
- [ ] Verify audit logs in Solopractice

---

## 🔍 Verification: How to Prove Red Team Stops

### Query Audit Logs in Solopractice

```sql
-- Prove emergency was intercepted
SELECT * FROM audit_logs
WHERE rule_id = 'R2'
  AND action = 'block'
  AND patient_id = '...'
ORDER BY created_at DESC;

-- Prove after-hours message was deferred
SELECT * FROM audit_logs
WHERE rule_id = 'R3'
  AND action = 'defer'
  AND patient_id = '...'
ORDER BY created_at DESC;

-- Prove refill was blocked
SELECT * FROM audit_logs
WHERE rule_id = 'R7'
  AND action = 'block'
  AND patient_id = '...'
ORDER BY created_at DESC;

-- Prove critical vital was escalated
SELECT * FROM audit_logs
WHERE rule_id = 'R5'
  AND action = 'escalate'
  AND patient_id = '...'
ORDER BY created_at DESC;
```

---

## 📚 References

- **Enforcement Service:** `C:\DEV\Solopractice\lib\enforcement\enforcementService.ts`
- **CG Rules Status:** `C:\DEV\Solopractice\zipnmd\CG1_COMPLETE_STATUS.md`
- **Red Team Checklist:** `C:\DEV\Solopractice\solopractice_red_team_due_diligence_checklist.md`
- **Policy Document:** `C:\DEV\Solopractice\solopractice_clinical_safety_availability_operations_policy.md`
- **Example Implementation:** `C:\DEV\Solopractice\app\api\portal\messages\threads\[id]\messages\route.ts`

---

**Last Updated:** December 2024  
**Status:** Architecture Defined - Ready for Implementation  
**Next:** Implement API client in MyHealth Ally
