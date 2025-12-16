# CG-5 Red Team Validation - Required Fixes

**Date:** December 2024  
**Status:** ❌ **CG-5 FAILED** - Critical fixes required

---

## 🔴 **Critical Failures (Must Fix)**

### **1. RT-2: No Timeline Export Functionality**

**Problem:**
- Cannot export audit logs for legal defense
- Cannot generate defensible timeline documents
- Regulator requests cannot be fulfilled

**Fix Required:**
```kotlin
// Add to AuditLogger.kt
suspend fun exportPatientTimeline(
    patientId: String,
    startDate: Date,
    endDate: Date,
    format: ExportFormat = ExportFormat.JSON
): Result<ByteArray> {
    val events = dao.getEventsByPatientDateRange(patientId, startDate, endDate)
    return when (format) {
        ExportFormat.JSON -> exportToJson(events)
        ExportFormat.CSV -> exportToCsv(events)
        ExportFormat.PDF -> exportToPdf(events)
    }
}

enum class ExportFormat { JSON, CSV, PDF }
```

**Also add to PWA:**
```typescript
// Add to provider-client.ts
async exportPatientTimeline(
  patientId: string,
  startDate: string,
  endDate: string,
  format: 'json' | 'csv' | 'pdf'
): Promise<Blob> {
  const response = await this.client.get(
    `/api/admin/patients/${patientId}/timeline`,
    {
      params: { startDate, endDate, format },
      responseType: 'blob'
    }
  );
  return response.data;
}
```

**Priority:** 🔴 **CRITICAL**

---

### **2. RT-2: No Client-Side SLA Tracking**

**Problem:**
- Cannot prove when SLA clock started
- Client has no visibility into SLA status
- Cannot defend against "you ignored me" claims

**Fix Required:**
```kotlin
// Add to MessagesRepository.kt or new SLA tracker
data class SLATracking(
    val messageId: String,
    val patientId: String,
    val submittedAt: Date,
    val practiceOpensAt: Date,
    val slaStartAt: Date,  // When SLA clock actually started
    val slaDueAt: Date,
    val status: SLAStatus
)

enum class SLAStatus {
    PENDING,      // Before practice opens
    ACTIVE,       // SLA clock running
    COMPLETED,    // Response received
    OVERDUE       // Past due date
}
```

**Also add to API response:**
```kotlin
// SoloPracticeModels.kt - MessageResponse
data class MessageResponse(
    // ... existing fields
    @SerializedName("sla_info") val slaInfo: SLAInfo? = null
)

data class SLAInfo(
    val slaStartAt: String,  // ISO timestamp
    val slaDueAt: String,
    val status: String  // "pending", "active", "completed", "overdue"
)
```

**Priority:** 🔴 **CRITICAL**

---

### **3. RT-2: Incomplete Patient Interaction Logging**

**Problem:**
- Deferred messages may not automatically log patient copy
- Emergency blocks may not log patient copy
- Audit trail incomplete

**Fix Required:**
```kotlin
// Update VoiceRecordingScreen.kt to log all interactions
// After showing deferred dialog:
scope.launch {
    val patientId = authRepository.getCurrentPatientId()
    patientInteractionLog.logPatientInteraction(
        patientId = patientId,
        interactionType = InteractionType.MESSAGE,
        practiceOpen = false,
        copyShown = "Message received after hours. Will be reviewed at $nextOpenAt.",
        actionTaken = ActionTaken.DEFERRED,
        reason = "After hours",
        metadata = mapOf(
            "nextOpenAt" to nextOpenAt,
            "messageId" to messageId
        )
    )
}

// After showing emergency dialog:
scope.launch {
    patientInteractionLog.logPatientInteraction(
        patientId = patientId,
        interactionType = InteractionType.MESSAGE,
        practiceOpen = false,
        copyShown = "Based on your symptoms, this appears to be a medical emergency. Please call 911 immediately.",
        actionTaken = ActionTaken.REDIRECTED,
        reason = "Emergency symptoms detected",
        metadata = mapOf(
            "symptomScreen" to symptomScreen.toString(),
            "messageId" to messageId
        )
    )
}
```

**Priority:** 🔴 **CRITICAL**

---

### **4. RT-7: Patient-Friendly Outage Messages**

**Problem:**
- Network errors may show technical messages to patients
- Outage errors not patient-friendly
- Poor user experience

**Fix Required:**
```kotlin
// Update SoloPracticeApiClient.kt error handling
catch (e: IOException) {
    // Check if it's a system outage
    val isOutage = checkSystemOutage() // Poll health endpoint
    
    if (isOutage) {
        Result.failure(
            AppError.SystemOutage(
                userMessage = "Our system is temporarily unavailable. Please try again in a few minutes.",
                technicalMessage = e.message ?: "Network error"
            )
        )
    } else {
        Result.failure(
            AppError.NetworkError(
                userMessage = "Unable to connect. Please check your internet connection.",
                technicalMessage = e.message ?: "Network error"
            )
        )
    }
}

// Update AppError
sealed class AppError {
    class SystemOutage(
        val userMessage: String,
        val technicalMessage: String
    ) : AppError(userMessage)
    
    class NetworkError(
        val userMessage: String,
        val technicalMessage: String
    ) : AppError(userMessage)
}
```

**Also update UI:**
```kotlin
// VoiceRecordingScreen.kt
when (error) {
    is AppError.SystemOutage -> {
        showErrorDialog = error.userMessage  // Show friendly message
    }
    is AppError.NetworkError -> {
        showErrorDialog = error.userMessage
    }
    // ...
}
```

**Priority:** 🟡 **HIGH**

---

### **5. RT-5: Client-Side Rate Limiting**

**Problem:**
- Rapid-fire refill requests may hit server multiple times
- No client-side debouncing

**Fix Required:**
```kotlin
// Add to MedicationsRepository.kt or create RateLimiter.kt
class RateLimiter(
    private val windowMs: Long = 5000,  // 5 second window
    private val maxRequests: Int = 1
) {
    private val requestTimestamps = mutableListOf<Long>()
    
    fun canProceed(): Boolean {
        val now = System.currentTimeMillis()
        requestTimestamps.removeAll { it < now - windowMs }
        
        return if (requestTimestamps.size < maxRequests) {
            requestTimestamps.add(now)
            true
        } else {
            false
        }
    }
}

// Use in refill request:
private val refillRateLimiter = RateLimiter(windowMs = 5000, maxRequests = 1)

suspend fun requestRefill(medicationId: String): Result<RefillResponse> {
    if (!refillRateLimiter.canProceed()) {
        return Result.failure(
            AppError.RateLimited(
                userMessage = "Please wait a moment before requesting again.",
                retryAfter = 5
            )
        )
    }
    // ... proceed with request
}
```

**Priority:** 🟡 **HIGH**

---

### **6. RT-7: Automatic Outage Detection**

**Problem:**
- Client may not automatically detect server outages
- Relies on error responses only

**Fix Required:**
```kotlin
// Add to SystemHealthMonitor.kt
class SystemHealthMonitor(
    private val apiClient: SoloPracticeApiClient,
    private val systemStatusStateMachine: SystemStatusStateMachine
) {
    private var lastHealthCheck: Date? = null
    private val healthCheckInterval = 60000L // 1 minute
    
    suspend fun checkSystemHealth(): SystemState {
        val now = Date()
        val lastCheck = lastHealthCheck
        
        // Only check if enough time has passed
        if (lastCheck != null && (now.time - lastCheck.time) < healthCheckInterval) {
            return systemStatusStateMachine.getCurrentSystemStatus()
        }
        
        try {
            val healthResult = apiClient.getSystemHealth()
            lastHealthCheck = now
            
            // Update local state based on health check
            if (healthResult.status == "unhealthy") {
                // System is down
                return SystemState.OUTAGE
            } else if (healthResult.status == "degraded") {
                return SystemState.DEGRADED
            }
            
            return SystemState.NORMAL
        } catch (e: Exception) {
            // Health check failed - assume degraded
            Logger.w("HealthMonitor", "Health check failed, assuming degraded", e)
            return SystemState.DEGRADED
        }
    }
}
```

**Priority:** 🟡 **HIGH**

---

### **7. RT-8: Explicit Runbook Documentation**

**Problem:**
- Runbooks may be implicit in code comments
- Not accessible to non-founders
- No explicit escalation procedures

**Fix Required:**
Create `RUNBOOKS.md` with:
- Alert escalation procedures
- Incident response procedures
- System outage response
- Support case handling
- On-call rotation procedures

**Priority:** 🟡 **HIGH**

---

## 🟡 **High-Priority Gaps (Should Fix)**

### **8. RT-3: RED Escalation Failure Detection**

**Problem:**
- RED escalation failure detection may be server-side only
- Client may not automatically trigger alerts

**Fix Required:**
- Document that RED escalation is server-side responsibility
- Add client-side monitoring if server sends escalation failure events
- Add webhook/event listener for escalation failures

**Priority:** 🟡 **HIGH**

---

### **9. RT-9: Complete Logging Coverage**

**Problem:**
- Some interactions may not be automatically logged
- Logging may be optional/manual

**Fix Required:**
- Audit all patient-facing screens
- Ensure every patient interaction calls `logPatientInteraction()`
- Add logging to:
  - Message sends (deferred/blocked/sent)
  - Refill requests (approved/blocked/pending)
  - Vital recordings (with urgency)
  - Appointment requests

**Priority:** 🟡 **HIGH**

---

## 🔵 **Medium-Priority (Nice to Have)**

### **10. RT-4: Telehealth Implementation**

**Status:** Not implemented

**Required:**
- Terminal state management
- Partial documentation preservation
- Automatic work item creation on failure
- Patient notification

**Priority:** 🔵 **MEDIUM**

---

### **11. RT-6: Discharge Summary Implementation**

**Status:** Not implemented

**Required:**
- Document upload
- Medication conflict detection
- Reconciliation work item creation
- Provider diff view
- Patient communication (no auto-changes)

**Priority:** 🔵 **MEDIUM**

---

## 📋 **Implementation Priority**

### **Phase 1: Critical Fixes (Must Do Before Sales)**
1. ✅ Timeline export functionality
2. ✅ Complete patient interaction logging
3. ✅ Patient-friendly error messages
4. ✅ Client-side SLA tracking (or document server-side)

### **Phase 2: High-Priority (Should Do Soon)**
5. ✅ Client-side rate limiting
6. ✅ Automatic outage detection
7. ✅ Explicit runbook documentation
8. ✅ Complete logging coverage audit

### **Phase 3: Medium-Priority (Can Do Later)**
9. ⏸️ Telehealth implementation
10. ⏸️ Discharge summary implementation

---

## ✅ **CG-5 Exit Criteria Status**

| Criterion | Status | Notes |
|-----------|--------|-------|
| Zero silent failures | ⚠️ PARTIAL | NoSilentFailure.kt exists but coverage incomplete |
| Zero ambiguous responsibility | ⚠️ PARTIAL | Ownership works but runbooks missing |
| Zero undocumented safety decisions | ⚠️ PARTIAL | Audit logging exists but export missing |
| No founder heroics required | ✅ PASS | Fallback chain works |
| Evidence > explanations | ⚠️ PARTIAL | Can query but cannot export |

**Overall:** ❌ **FAIL** - Critical fixes required

---

## 🎯 **Next Steps**

1. **Implement Critical Fixes (Phase 1)**
2. **Re-test all RT scenarios**
3. **Document evidence for each scenario**
4. **Re-run CG-5 validation**
5. **Pass CG-5 before enterprise sales**

---

**Last Updated:** December 2024  
**Status:** ❌ **CG-5 FAILED** - See fixes above
