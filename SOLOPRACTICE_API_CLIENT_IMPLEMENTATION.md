# Solopractice API Client Implementation Summary

**Date:** December 2024  
**Status:** ✅ Phase 1 Complete - API Client Created

---

## ✅ What Has Been Implemented

### 1. API Models (`SoloPracticeModels.kt`)
Created comprehensive data models for all Solopractice API requests and responses:
- **Authentication:** `ActivateAccountRequest/Response`, `RefreshTokenRequest/Response`
- **Symptom Screen:** `SymptomScreenResult` - collects emergency symptoms for R2 enforcement
- **Messages:** `SendMessageRequest`, `MessageResponse` (with deferred/blocked status fields)
- **Medications:** `RefillRequestRequest/Response`, `Medication`
- **Measurements:** `RecordMeasurementRequest`, `MeasurementResponse` (with urgency/escalation)
- **Appointments:** `AppointmentRequestRequest/Response`
- **Errors:** `ApiError` for structured error responses

### 2. API Interface (`SoloPracticeApi.kt`)
Created Retrofit interface with all required endpoints:
- ✅ `POST /api/portal/auth/activate` - Account activation
- ✅ `POST /api/portal/auth/refresh` - Token refresh
- ✅ `GET /api/portal/messages/threads` - Get threads (R10)
- ✅ `GET /api/portal/messages/threads/{id}` - Get messages (R10)
- ✅ `POST /api/portal/messages/threads/{id}/messages` - Send message (R1, R2, R3)
- ✅ `PATCH /api/portal/messages/{id}/read` - Mark as read
- ✅ `GET /api/portal/meds` - Get medications (R10)
- ✅ `POST /api/portal/meds/refill-requests` - Request refill (R7)
- ✅ `POST /api/portal/measurements` - Record measurement (R4, R5)
- ✅ `GET /api/portal/measurements` - Get measurements (R10)
- ✅ `POST /api/portal/appointments/request` - Request appointment (R1, R4)

### 3. API Client (`SoloPracticeApiClient.kt`)
Created comprehensive API client with:
- ✅ **JWT Authentication:** Automatic token injection in headers
- ✅ **Token Refresh:** Automatic refresh on 401, with retry logic
- ✅ **Error Handling:** Proper mapping of 403 (Rule Blocked), 429 (Rate Limited), 401 (Unauthorized)
- ✅ **Custom Error Types:** `AppError` sealed class for type-safe error handling
- ✅ **Logging:** Request/response logging in debug mode
- ✅ **Convenience Methods:** High-level methods for all API operations

### 4. PIN Manager Updates (`PINManager.kt`)
Extended to support refresh tokens:
- ✅ `saveRefreshToken()` / `getRefreshToken()` / `clearRefreshToken()`
- ✅ `clearAllAuth()` - clears both access and refresh tokens

### 5. Symptom Screen Component (`SymptomScreen.kt`)
Created UI component for collecting emergency symptoms:
- ✅ Collects all emergency symptoms (chest pain, shortness of breath, etc.)
- ✅ Optional "other symptoms" text field
- ✅ Warning message if emergency symptoms detected
- ✅ Returns `SymptomScreenResult` for API submission

### 6. Build Configuration (`build.gradle.kts`)
Updated API base URL configuration:
- ✅ Debug: `http://10.0.2.2:3000` (local development)
- ✅ Release: Placeholder for production URL (needs to be updated)

---

## 📋 Next Steps (As Per Integration Guide)

### Phase 2: Replace Supabase Calls with Solopractice API

#### 2.1 Messages Repository
**File:** `app/src/main/java/com/agyeman/myhealthally/data/repositories/MessagesRepository.kt`

**Replace:**
- ❌ `supabase.from("messages")` → ✅ `apiClient.getThreadMessages()`
- ❌ `supabase.from("message_threads")` → ✅ `apiClient.getThreads()`
- ❌ `supabase.from("messages").insert()` → ✅ `apiClient.sendMessage()`
- ❌ Direct Supabase storage upload → ✅ Upload via Solopractice API (or keep storage, but send URL through API)

**Handle:**
- ✅ Deferred messages: `response.status == "after_hours_deferred"` → Show `nextOpenAt`
- ✅ Blocked messages: `response.status == "blocked"` → Show reason, handle `action == "redirect_emergency"`

#### 2.2 Measurements Repository
**File:** `app/src/main/java/com/agyeman/myhealthally/data/repositories/MeasurementsRepository.kt`

**Replace:**
- ❌ `supabase.from("measurements").insert()` → ✅ `apiClient.recordMeasurement()`
- ❌ `supabase.from("measurements").select()` → ✅ `apiClient.getMeasurements()`

**Handle:**
- ✅ Urgency responses: `response.urgency` (green/yellow/red)
- ✅ Escalation notifications: `response.escalated == true`

#### 2.3 Patients Repository
**File:** `app/src/main/java/com/agyeman/myhealthally/data/repositories/PatientsRepository.kt`

**Note:** May need new Solopractice endpoints for patient profile operations, or keep Supabase for read-only profile data if approved.

#### 2.4 Voice Recording Screen
**File:** `app/src/main/java/com/agyeman/myhealthally/ui/screens/VoiceRecordingScreen.kt`

**Add:**
- ✅ Show symptom screen before sending after-hours messages
- ✅ Integrate `SoloPracticeApiClient` for sending messages
- ✅ Handle deferred/blocked responses
- ✅ Show appropriate UI for each response type

**Example Integration:**
```kotlin
// After recording, before sending:
val isAfterHours = // Check current time vs practice hours (or let server decide)

if (isAfterHours) {
    // Show symptom screen
    SymptomScreen(
        onComplete = { symptomScreen ->
            sendMessageWithSymptomScreen(audioFile, symptomScreen)
        },
        onCancel = { /* cancel */ }
    )
} else {
    sendMessage(audioFile, symptomScreen = null)
}

// Send message
suspend fun sendMessage(audioFile: File, symptomScreen: SymptomScreenResult?) {
    val apiClient = SoloPracticeApiClient(context)
    
    // Upload audio (via Solopractice or Supabase storage)
    val audioUrl = uploadAudio(audioFile)
    
    // Send message
    val result = apiClient.sendMessage(
        threadId = threadId,
        body = transcript ?: "Voice message",
        symptomScreen = symptomScreen,
        attachments = mapOf("audio_url" to audioUrl)
    )
    
    result.onSuccess { response ->
        when (response.status) {
            "sent" -> showSuccess()
            "after_hours_deferred" -> showDeferred(response.nextOpenAt)
            "blocked" -> {
                if (response.action == "redirect_emergency") {
                    showEmergencyRedirect()
                } else {
                    showBlocked(response.reason)
                }
            }
        }
    }.onFailure { error ->
        when (error) {
            is SoloPracticeApiClient.AppError.RuleBlocked -> showRuleBlocked(error.reason)
            is SoloPracticeApiClient.AppError.RateLimited -> showRateLimited(error.retryAfter)
            is SoloPracticeApiClient.AppError.Unauthorized -> navigateToLogin()
            else -> showError(error.message)
        }
    }
}
```

### Phase 3: Testing

#### 3.1 Test After-Hours Message Flow
- ✅ Send message after practice hours
- ✅ Verify symptom screen appears
- ✅ Verify deferred response handling
- ✅ Verify `nextOpenAt` is displayed

#### 3.2 Test Emergency Symptom Detection
- ✅ Select emergency symptoms in symptom screen
- ✅ Send message
- ✅ Verify blocked response with `action == "redirect_emergency"`
- ✅ Verify 911 redirect UI appears

#### 3.3 Test Refill Blocking
- ✅ Request refill without required labs
- ✅ Verify blocked response
- ✅ Verify required labs are displayed

#### 3.4 Test Critical Vital Escalation
- ✅ Record critical BP (e.g., 180/120)
- ✅ Verify `urgency == "red"` response
- ✅ Verify `escalated == true` response

#### 3.5 Verify Audit Logs
- ✅ Check Solopractice audit logs for all actions
- ✅ Verify R1, R2, R3, R4, R5, R7, R10 enforcement logged

---

## 🔧 Configuration Required

### 1. Update API Base URL
**File:** `app/build.gradle.kts`

Update the production URL:
```kotlin
release {
    buildConfigField("String", "API_BASE_URL", "\"https://your-actual-solopractice-domain.com\"")
}
```

### 2. Update Local Development URL (if needed)
If your local Solopractice backend runs on a different port:
```kotlin
debug {
    buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:YOUR_PORT\"")
}
```

---

## 📁 Files Created

1. ✅ `app/src/main/java/com/agyeman/myhealthally/data/models/solopractice/SoloPracticeModels.kt`
2. ✅ `app/src/main/java/com/agyeman/myhealthally/data/api/SoloPracticeApi.kt`
3. ✅ `app/src/main/java/com/agyeman/myhealthally/data/api/SoloPracticeApiClient.kt`
4. ✅ `app/src/main/java/com/agyeman/myhealthally/ui/screens/SymptomScreen.kt`

## 📝 Files Modified

1. ✅ `app/src/main/java/com/agyeman/myhealthally/managers/PINManager.kt` - Added refresh token support
2. ✅ `app/build.gradle.kts` - Updated API base URL comments

---

## 🚨 Important Notes

### DO NOT:
- ❌ Call Supabase directly for operations that should go through Solopractice API
- ❌ Enforce CG rules client-side (R1-R12 are server-side only)
- ❌ Bypass symptom screen for after-hours messages

### DO:
- ✅ Always use `SoloPracticeApiClient` for API calls
- ✅ Show symptom screen before after-hours messages
- ✅ Handle all response statuses (sent, deferred, blocked)
- ✅ Display appropriate UI for each response type
- ✅ Let server enforce all rules

---

## 📚 References

- **Integration Guide:** `SOLOPRACTICE_INTEGRATION_GUIDE.md`
- **CG Rules:** See integration guide for R1-R12 details
- **Red Team Stops:** See integration guide for verification steps

---

**Next:** Start replacing Supabase calls in repositories with Solopractice API calls.
