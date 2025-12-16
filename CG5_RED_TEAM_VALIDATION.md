# CG-5 — Red Team Validation Sprint for MyHealth Ally

**Date:** December 2024  
**Goal:** Try to kill MyHealth Ally before the market does.  
**Status:** 🔴 **IN PROGRESS**

---

## ⚠️ **Critical Context: Thin Client Architecture**

**MyHealth Ally is a thin client.** Most enforcement (R1-R12) happens **server-side in Solopractice**, not in the mobile app.

**What MHA Must Prove:**
- ✅ Client-side safety checks work
- ✅ Server responses are handled correctly
- ✅ Failures are logged and audited
- ✅ Patient sees correct copy
- ✅ No silent failures
- ✅ Network failures handled gracefully

---

## 🎭 **Red Team Personas**

1. **Malpractice Attorney** - "Can you prove the patient was redirected?"
2. **Burned-out Solo Clinician** - "Why did I get spammed at 3 AM?"
3. **Angry Patient** - "You ignored my emergency message!"
4. **Skeptical Healthcare Investor** - "What happens when it breaks?"

---

## 🔴 **RT-1: Emergency Misuse Attempt**

### **Scenario**
- Patient submits chest pain message at 02:37
- Multiple message attempts
- Tries to bypass UI (API direct calls)

### **Must Prove**
- ✅ Message blocked
- ✅ ED redirect shown
- ✅ Audit log exists
- ✅ No work item created
- ✅ Morning staff does not inherit liability

### **Test Results**

#### **✅ PASS: Symptom Screen Collection**
**Evidence:**
- `SymptomScreen.kt` collects emergency symptoms
- `VoiceRecordingScreen.kt` shows symptom screen before after-hours messages
- Symptom data sent to Solopractice API

**Code:**
```kotlin
// SymptomScreen.kt - Collects emergency symptoms
data class SymptomScreenResult(
    val hasChestPain: Boolean,
    val hasShortnessOfBreath: Boolean,
    // ... other symptoms
)
```

#### **✅ PASS: Server Response Handling**
**Evidence:**
- `VoiceRecordingScreen.kt` handles `status: "blocked"` responses
- Shows emergency dialog when `action: "redirect_emergency"`
- Displays 911 redirect button

**Code:**
```kotlin
// VoiceRecordingScreen.kt:217-221
"blocked" -> {
    if (message.action == "redirect_emergency") {
        showEmergencyDialog = true
    } else {
        showBlockedDialog = message.reason ?: "Message was blocked"
    }
}
```

#### **⚠️ PARTIAL: Audit Logging**
**Evidence:**
- `AuditLogger.kt` exists and can log PHI access
- `PatientInteractionLog.kt` can log patient interactions
- **GAP:** Not clear if emergency blocks are automatically logged client-side

**Code:**
```kotlin
// AuditLogger.kt:38-62
suspend fun logPHIAccess(
    resource: String,
    action: String,
    userId: String? = null,
    patientId: String? = null,
    details: Map<String, String>? = null
)
```

**Issue:** Emergency block logging may depend on server-side audit only.

#### **✅ PASS: No Work Item Created**
**Evidence:**
- Blocked messages return `status: "blocked"` from server
- Client does not create work items
- Server-side enforcement prevents work item creation

#### **✅ PASS: Patient Copy**
**Evidence:**
- Emergency dialog shows: "Based on your symptoms, this appears to be a medical emergency. Please call 911 immediately."
- Clear 911 redirect button
- Patient sees exact copy

**Code:**
```kotlin
// VoiceRecordingScreen.kt:316-318
Text("Based on your symptoms, this appears to be a medical emergency. Please call 911 immediately.")
```

### **RT-1 Verdict: ⚠️ PARTIAL PASS**

**Passes:**
- ✅ Symptom screen collection
- ✅ Server response handling
- ✅ Patient copy display
- ✅ No work item creation

**Gaps:**
- ⚠️ Client-side audit logging of emergency blocks not explicitly verified
- ⚠️ API bypass protection relies on server-side only

**Recommendation:**
- Add explicit client-side audit logging when emergency block occurs
- Document that API bypass protection is server-side responsibility

---

## 🔴 **RT-2: "You Ignored Me" Claim**

### **Scenario**
- After-hours message at 21:14
- Clinic opens at 08:00
- Patient complains at 08:03

### **Must Prove**
- ✅ SLA clock started at opening
- ✅ Patient-visible copy logged
- ✅ Response within SLA
- ✅ Defensible timeline exportable

### **Test Results**

#### **✅ PASS: After-Hours Deferral Display**
**Evidence:**
- `VoiceRecordingScreen.kt` shows deferred dialog
- Displays `nextOpenAt` time to patient
- Clear message: "Message received after hours. Will be reviewed at [time]."

**Code:**
```kotlin
// VoiceRecordingScreen.kt:277-283
title = { Text("Message Received After Hours") },
Text("Your message has been received and will be reviewed when the practice opens."),
if (nextOpenAt.isNotBlank()) {
    Text("Practice opens at: $nextOpenAt")
}
```

#### **⚠️ PARTIAL: Patient Copy Logging**
**Evidence:**
- `PatientInteractionLog.kt` exists with `logPatientInteraction()` method
- Can log `copyShown` parameter
- **GAP:** Not clear if deferred messages automatically log patient copy

**Code:**
```kotlin
// PatientInteractionLog.kt:29-70
suspend fun logPatientInteraction(
    patientId: String,
    interactionType: InteractionType,
    practiceOpen: Boolean,
    copyShown: String, // The exact text shown to patient
    actionTaken: ActionTaken,
    // ...
)
```

**Issue:** Deferred message logging may not be automatically called.

#### **❌ FAIL: SLA Clock Tracking**
**Evidence:**
- No client-side SLA tracking found
- SLA enforcement is server-side only
- Client cannot prove when SLA clock started

**Gap:** Client has no way to verify SLA start time or export timeline.

#### **❌ FAIL: Timeline Export**
**Evidence:**
- `AuditLogger.kt` can query events by patient
- `PatientInteractionLog.kt` can reconstruct patient view
- **GAP:** No export functionality for defensible timeline

**Code:**
```kotlin
// AuditLogger.kt:143-145
suspend fun getEventsByPatientBeforeTimestamp(patientId: String, timestamp: Date): List<AuditEvent>
```

**Issue:** Can query but cannot export formatted timeline for legal defense.

### **RT-2 Verdict: ❌ FAIL**

**Passes:**
- ✅ After-hours deferral display
- ✅ Patient sees correct copy

**Fails:**
- ❌ No client-side SLA tracking
- ❌ No timeline export functionality
- ⚠️ Patient copy logging not automatically called

**Recommendation:**
- Add explicit `logPatientInteraction()` call when deferred message is displayed
- Add timeline export functionality (CSV/JSON) for legal defense
- Document that SLA tracking is server-side responsibility

---

## 🔴 **RT-3: RED Escalation Miss**

### **Scenario**
- RED item created
- Assigned provider unreachable
- 30 minutes elapse

### **Must Prove**
- ✅ Escalation fired
- ✅ Ownership fallback triggered
- ✅ Incident + support case created
- ✅ Alert logged

### **Test Results**

#### **✅ PASS: Alert Service**
**Evidence:**
- `AlertService.kt` exists with `triggerAlert()` method
- Handles `RED_ESCALATION_FAILED` alert type
- Ownership resolution with fallback chain

**Code:**
```kotlin
// AlertService.kt:30-89
suspend fun triggerAlert(
    alertType: AlertType,
    payload: Map<String, Any>
) {
    val owner = ownershipResolver.resolveOnCallOwner()
    // ... sends alert
}
```

#### **✅ PASS: Ownership Resolution**
**Evidence:**
- `OwnershipResolver.kt` has fallback chain:
  1. Explicit on-call owner
  2. Admin fallback
  3. System owner (never null)

**Code:**
```kotlin
// OwnershipResolver.kt:56-60
fun resolveOnCallOwner(): AlertChannel {
    return explicitOnCallOwner
        ?: adminFallback
        ?: systemOwner  // Never null
}
```

#### **⚠️ PARTIAL: Escalation Triggering**
**Evidence:**
- Alert service can trigger alerts
- **GAP:** Not clear if RED escalation failures automatically trigger alerts
- Escalation logic may be server-side only

**Issue:** Client may not detect RED escalation failures.

#### **✅ PASS: Alert Logging**
**Evidence:**
- `AlertLogger.kt` logs all alert attempts
- `AlertService.kt` logs to audit log
- Deduplication prevents spam

**Code:**
```kotlin
// AlertService.kt:66-72
alertLogger.logAlert(
    alert = alert,
    channel = owner,
    delivered = result.delivered,
    suppressed = result.suppressed,
    relatedIncidentId = payload["incident_id"] as? String
)
```

### **RT-3 Verdict: ⚠️ PARTIAL PASS**

**Passes:**
- ✅ Alert service exists
- ✅ Ownership resolution with fallback
- ✅ Alert logging

**Gaps:**
- ⚠️ RED escalation failure detection may be server-side only
- ⚠️ Client may not automatically trigger alerts on escalation failure

**Recommendation:**
- Document that RED escalation is server-side responsibility
- Add client-side monitoring if server sends escalation failure events

---

## 🔴 **RT-4: Telehealth Collapse Mid-Visit**

### **Scenario**
- Video drops during active visit
- Audio fallback fails

### **Must Prove**
- ✅ Visit has terminal state
- ✅ Partial documentation preserved
- ✅ Follow-up work item created
- ✅ Patient notified correctly

### **Test Results**

#### **❌ FAIL: Telehealth Implementation**
**Evidence:**
- No telehealth implementation found in codebase
- No video/audio handling code
- No visit state management

**Gap:** Telehealth feature not implemented.

### **RT-4 Verdict: ❌ FAIL (Not Implemented)**

**Status:** Telehealth feature not implemented. Cannot test.

**Recommendation:**
- Implement telehealth with:
  - Terminal state management
  - Partial documentation preservation
  - Automatic work item creation on failure
  - Patient notification

---

## 🔴 **RT-5: Unsafe Refill Attempt**

### **Scenario**
- Patient requests refill
- Required lab overdue
- Repeats request aggressively

### **Must Prove**
- ✅ Refill blocked every time
- ✅ Required actions communicated
- ✅ No silent override
- ✅ Provider not spammed unnecessarily

### **Test Results**

#### **✅ PASS: Refill Request Handling**
**Evidence:**
- `SoloPracticeApiClient.kt` handles refill requests
- Returns `status: "blocked"` with `reason` and `required_labs`
- Client displays blocked message

**Code:**
```kotlin
// SoloPracticeModels.kt:107-111
data class RefillResponse(
    @SerializedName("status") val status: String, // "approved", "blocked", "pending"
    @SerializedName("reason") val reason: String?,
    @SerializedName("required_labs") val requiredLabs: List<String>?
)
```

#### **✅ PASS: Patient Communication**
**Evidence:**
- PWA `medications/page.tsx` shows blocked refill with reason
- Displays required labs list
- Clear patient-facing copy

**Code:**
```typescript
// medications/page.tsx:89-106
{requestRefillMutation.data.status === 'blocked' && (
  <div>
    <p className="font-semibold">Refill blocked</p>
    {requestRefillMutation.data.reason && (
      <p className="text-sm mt-1">{requestRefillMutation.data.reason}</p>
    )}
    {requestRefillMutation.data.required_labs && (
      <ul className="list-disc list-inside text-sm mt-1">
        {requestRefillMutation.data.required_labs.map((lab, idx) => (
          <li key={idx}>{lab}</li>
        ))}
      </ul>
    )}
  </div>
)}
```

#### **✅ PASS: Server-Side Enforcement**
**Evidence:**
- Refill blocking is server-side (R7 enforcement)
- Client cannot override
- Each request goes through server validation

#### **⚠️ PARTIAL: Provider Spam Prevention**
**Evidence:**
- Server-side deduplication likely
- **GAP:** Client-side rate limiting not verified
- Multiple rapid requests may hit server multiple times

**Issue:** Client may send multiple requests before server responds.

### **RT-5 Verdict: ✅ PASS**

**Passes:**
- ✅ Refill blocked every time (server-side)
- ✅ Required actions communicated
- ✅ No silent override
- ✅ Patient sees clear copy

**Minor Gap:**
- ⚠️ Client-side rate limiting could prevent rapid-fire requests

**Recommendation:**
- Add client-side debouncing for refill requests
- Document that blocking is server-side responsibility

---

## 🔴 **RT-6: Hospital Discharge Chaos**

### **Scenario**
- Patient uploads discharge summary
- Med list conflicts with chart

### **Must Prove**
- ✅ No auto-med change
- ✅ Reconciliation task created
- ✅ Provider sees diff
- ✅ Patient not promised changes

### **Test Results**

#### **❌ FAIL: Discharge Summary Upload**
**Evidence:**
- No discharge summary upload feature found
- No medication reconciliation feature
- No document upload handling

**Gap:** Feature not implemented.

### **RT-6 Verdict: ❌ FAIL (Not Implemented)**

**Status:** Discharge summary and medication reconciliation not implemented.

**Recommendation:**
- Implement with:
  - Document upload
  - Medication conflict detection
  - Reconciliation work item creation
  - Provider diff view
  - Patient communication (no auto-changes)

---

## 🔴 **RT-7: System Outage During Business Hours**

### **Scenario**
- DB unavailable at 11:00
- Messaging + telehealth affected

### **Must Prove**
- ✅ System enters degraded/outage
- ✅ Kill switches enforce safety
- ✅ Patients receive correct copy
- ✅ Incident logged
- ✅ Alert sent

### **Test Results**

#### **✅ PASS: System Status Awareness**
**Evidence:**
- `SystemStatusStateMachine.kt` tracks system status
- `EnforcementAwareness.kt` checks system status
- Throws `SystemOutageException` when in outage

**Code:**
```kotlin
// EnforcementAwareness.kt:42-61
suspend fun assertSystemNormal() {
    val check = checkSystemStatus()
    when (check.status) {
        SystemState.OUTAGE -> {
            throw SystemOutageException("System is in outage state")
        }
        // ...
    }
}
```

#### **✅ PASS: Kill Switches**
**Evidence:**
- `KillSwitches.kt` can pause messaging
- `assertAllowed()` blocks operations
- Read-only mode available

**Code:**
```kotlin
// KillSwitches.kt:71-78
KillSwitchOperation.SEND_MESSAGE -> {
    if (effectiveState.messagingPaused) {
        throw KillSwitchException("Messaging paused: ${effectiveState.messagingReason}")
    }
    if (effectiveState.readOnly) {
        throw KillSwitchException("Read-only mode active: ${effectiveState.readOnlyReason}")
    }
}
```

#### **⚠️ PARTIAL: Patient Copy on Outage**
**Evidence:**
- Error handling exists in `SoloPracticeApiClient.kt`
- **GAP:** Not clear if outage-specific patient copy is shown
- Generic error messages may not be patient-friendly

**Code:**
```kotlin
// SoloPracticeApiClient.kt:281-285
AppError.RuleBlocked(
    message = error?.message ?: "Action blocked by safety rule",
    reason = error?.reason
)
```

**Issue:** Outage errors may show technical messages to patients.

#### **✅ PASS: Incident Logging**
**Evidence:**
- `IncidentLifecycle.kt` can create incidents
- `SystemStatusStateMachine.kt` reads incidents
- Audit logging on incident creation

**Code:**
```kotlin
// IncidentLifecycle.kt:24-70
suspend fun createIncident(
    request: CreateIncidentRequest,
    adminUserId: String
): Result<IncidentLog>
```

#### **✅ PASS: Alert Service**
**Evidence:**
- `AlertService.kt` can trigger `SYSTEM_OUTAGE` alerts
- Ownership resolution works
- Alerts logged

**Code:**
```kotlin
// AlertService.kt:104-111
AlertType.SYSTEM_OUTAGE -> Alert(
    title = "System Outage",
    message = "System has entered outage state",
    severity = AlertSeverity.CRITICAL,
    relatedIncidentId = payload["incident_id"] as? String
)
```

### **RT-7 Verdict: ⚠️ PARTIAL PASS**

**Passes:**
- ✅ System status awareness
- ✅ Kill switches
- ✅ Incident logging
- ✅ Alert service

**Gaps:**
- ⚠️ Patient copy on outage may be too technical
- ⚠️ Client may not automatically detect server outages

**Recommendation:**
- Add patient-friendly outage messages
- Add automatic outage detection from health endpoint
- Show clear "System temporarily unavailable" message to patients

---

## 🔴 **RT-8: Founder Disappears**

### **Scenario**
- You do nothing for 72 hours
- Support case + incident occur

### **Must Prove**
- ✅ Someone else owns resolution
- ✅ Alerts route correctly
- ✅ Runbooks sufficient
- ✅ No "wait for founder"

### **Test Results**

#### **✅ PASS: Ownership Resolution**
**Evidence:**
- `OwnershipResolver.kt` has fallback chain
- System owner is default (not founder-specific)
- No hardcoded founder dependency

**Code:**
```kotlin
// OwnershipResolver.kt:19-22
private val systemOwner: AlertChannel = AlertChannel.EmailChannel(
    target = "system-owner@solopractice.com",  // Configurable, not founder
    enabled = true
)
```

#### **✅ PASS: Alert Routing**
**Evidence:**
- Alerts route to resolved owner
- Fallback chain ensures delivery
- No founder-specific routing

#### **⚠️ PARTIAL: Runbooks**
**Evidence:**
- Code has comments and documentation
- **GAP:** No explicit runbook system
- Documentation exists but may not be sufficient for non-founders

**Issue:** Runbooks may be implicit in code comments only.

#### **✅ PASS: No Founder Dependency**
**Evidence:**
- No hardcoded founder email/phone
- System owner is configurable
- Admin fallback exists

### **RT-8 Verdict: ✅ PASS**

**Passes:**
- ✅ Ownership resolution with fallback
- ✅ Alert routing
- ✅ No founder dependency

**Minor Gap:**
- ⚠️ Runbooks could be more explicit

**Recommendation:**
- Create explicit runbook documentation
- Document alert escalation procedures

---

## 🔴 **RT-9: Data Forensics Drill**

### **Scenario**
- Regulator asks: "Show us exactly what this patient saw and when."

### **Must Prove**
- ✅ Copy
- ✅ Timestamps
- ✅ Decisions
- ✅ Approvals
- ✅ Escalations
- ✅ All reconstructable

### **Test Results**

#### **✅ PASS: Audit Logging**
**Evidence:**
- `AuditLogger.kt` logs PHI access
- `PatientInteractionLog.kt` logs patient interactions with exact copy
- Room database persists all events

**Code:**
```kotlin
// PatientInteractionLog.kt:75-95
suspend fun reconstructPatientView(
    patientId: String,
    timestamp: Date,
    interactionType: InteractionType? = null
): List<PatientInteractionLogEntry>
```

#### **✅ PASS: Patient View Reconstruction**
**Evidence:**
- `reconstructPatientView()` can query by patient and timestamp
- Returns exact copy shown to patient
- Includes timestamps and decisions

**Code:**
```kotlin
// AuditLogger.kt:143-145
suspend fun getEventsByPatientBeforeTimestamp(patientId: String, timestamp: Date): List<AuditEvent>
```

#### **❌ FAIL: Export Functionality**
**Evidence:**
- Can query audit logs
- Can reconstruct patient view
- **GAP:** No export functionality (CSV/JSON/PDF)
- Cannot generate defensible timeline document

**Issue:** Data exists but cannot be exported for legal defense.

#### **⚠️ PARTIAL: Complete Coverage**
**Evidence:**
- Patient interactions can be logged
- **GAP:** Not all interactions may be automatically logged
- Some logging may be manual/optional

**Issue:** Coverage may be incomplete if logging is not automatic.

### **RT-9 Verdict: ⚠️ PARTIAL PASS**

**Passes:**
- ✅ Audit logging infrastructure
- ✅ Patient view reconstruction
- ✅ Timestamp tracking

**Fails:**
- ❌ No export functionality
- ⚠️ Logging coverage may be incomplete

**Recommendation:**
- Add export functionality (CSV/JSON/PDF)
- Ensure all patient interactions are automatically logged
- Add timeline generation for legal defense

---

## 🔴 **RT-10: Investor Kill Questions**

### **Questions & Answers**

#### **Q1: "What happens when it breaks?"**

**Answer:**
- ✅ System status state machine tracks outages
- ✅ Kill switches can pause unsafe operations
- ✅ Incidents are logged
- ✅ Alerts are sent
- ⚠️ Client may not automatically detect all failure modes

**Evidence:**
- `SystemStatusStateMachine.kt`
- `KillSwitches.kt`
- `IncidentLifecycle.kt`
- `AlertService.kt`

#### **Q2: "Who responds?"**

**Answer:**
- ✅ Ownership resolution with fallback chain
- ✅ System owner is default (not founder)
- ✅ Admin fallback exists
- ✅ Alerts route to resolved owner

**Evidence:**
- `OwnershipResolver.kt` - Fallback chain
- `AlertService.kt` - Routes to owner

#### **Q3: "How fast?"**

**Answer:**
- ✅ Alert service exists
- ✅ Deduplication prevents spam
- ⚠️ Response time not explicitly defined
- ⚠️ SLA tracking is server-side only

**Evidence:**
- `AlertService.kt` - Immediate alert triggering
- Server-side SLA enforcement

#### **Q4: "How do you prove safety?"**

**Answer:**
- ✅ Audit logging exists
- ✅ Patient interactions logged
- ✅ No silent failure enforcement
- ⚠️ Export functionality missing
- ⚠️ Some logging may be incomplete

**Evidence:**
- `AuditLogger.kt`
- `PatientInteractionLog.kt`
- `NoSilentFailure.kt`

#### **Q5: "Where does liability stop?"**

**Answer:**
- ✅ Server-side enforcement (Solopractice)
- ✅ Client handles responses correctly
- ✅ Audit trail exists
- ⚠️ Client-side logging may be incomplete
- ⚠️ Some features not implemented

**Evidence:**
- Thin client architecture
- Server-side CG rules (R1-R12)
- Client-side audit logging

### **RT-10 Verdict: ⚠️ PARTIAL PASS**

**Passes:**
- ✅ System failure handling
- ✅ Ownership resolution
- ✅ Safety proof infrastructure

**Gaps:**
- ⚠️ Export functionality missing
- ⚠️ Some features not implemented
- ⚠️ Response time SLAs not explicit

---

## 📊 **CG-5 Overall Results**

### **Summary**

| Scenario | Status | Critical Issues |
|----------|--------|----------------|
| RT-1: Emergency Misuse | ⚠️ PARTIAL | Client-side audit logging gaps |
| RT-2: "You Ignored Me" | ❌ FAIL | No SLA tracking, no timeline export |
| RT-3: RED Escalation | ⚠️ PARTIAL | Escalation detection may be server-side only |
| RT-4: Telehealth Collapse | ❌ FAIL | Feature not implemented |
| RT-5: Unsafe Refill | ✅ PASS | Minor: client-side rate limiting |
| RT-6: Discharge Chaos | ❌ FAIL | Feature not implemented |
| RT-7: System Outage | ⚠️ PARTIAL | Patient copy on outage, auto-detection |
| RT-8: Founder Disappears | ✅ PASS | Minor: runbook documentation |
| RT-9: Data Forensics | ⚠️ PARTIAL | No export functionality |
| RT-10: Investor Questions | ⚠️ PARTIAL | Export, SLAs, some features missing |

### **Critical Failures**

1. **❌ RT-2: No SLA Tracking/Export**
   - Cannot prove when SLA clock started
   - Cannot export defensible timeline
   - **Impact:** Legal liability risk

2. **❌ RT-4: Telehealth Not Implemented**
   - Feature missing
   - **Impact:** Cannot test failure scenarios

3. **❌ RT-6: Discharge Summary Not Implemented**
   - Feature missing
   - **Impact:** Cannot test medication reconciliation

### **Critical Gaps**

1. **⚠️ Export Functionality Missing**
   - Audit logs cannot be exported
   - Timeline cannot be generated
   - **Impact:** Cannot provide legal defense evidence

2. **⚠️ Incomplete Client-Side Logging**
   - Some interactions may not be automatically logged
   - **Impact:** Incomplete audit trail

3. **⚠️ Patient Copy on Outage**
   - May show technical errors
   - **Impact:** Poor patient experience

---

## 🔧 **Required Fixes**

### **Priority 1: Critical (Must Fix)**

1. **Add Timeline Export Functionality**
   - Export audit logs to CSV/JSON/PDF
   - Generate defensible timeline documents
   - Include patient copy, timestamps, decisions

2. **Ensure Complete Patient Interaction Logging**
   - Automatically log all patient-facing decisions
   - Log deferred messages
   - Log emergency blocks
   - Log refill responses

3. **Add Patient-Friendly Outage Messages**
   - Show clear "System temporarily unavailable" message
   - Don't show technical error details to patients

### **Priority 2: High (Should Fix)**

4. **Add Client-Side Rate Limiting**
   - Debounce refill requests
   - Prevent rapid-fire API calls

5. **Add Automatic Outage Detection**
   - Poll health endpoint
   - Detect server outages automatically
   - Show outage state to patients

6. **Create Explicit Runbooks**
   - Document alert escalation procedures
   - Document incident response procedures
   - Make accessible to non-founders

### **Priority 3: Medium (Nice to Have)**

7. **Implement Telehealth**
   - Terminal state management
   - Partial documentation preservation
   - Automatic work item creation

8. **Implement Discharge Summary**
   - Document upload
   - Medication reconciliation
   - Provider diff view

---

## ✅ **CG-5 Exit Criteria**

### **Current Status: ❌ FAIL**

**CG-5 passes only if:**
- ✅ Zero silent failures - **PARTIAL** (NoSilentFailure.kt exists but coverage may be incomplete)
- ⚠️ Zero ambiguous responsibility - **PARTIAL** (Ownership resolution works but runbooks missing)
- ⚠️ Zero undocumented safety decisions - **PARTIAL** (Audit logging exists but export missing)
- ✅ No founder heroics required - **PASS** (Fallback chain works)
- ⚠️ Evidence > explanations - **PARTIAL** (Can query but cannot export)

### **Blockers to Pass**

1. **Timeline Export** - Cannot provide legal defense evidence
2. **Complete Logging Coverage** - Some interactions may not be logged
3. **Patient-Friendly Error Messages** - Technical errors shown to patients
4. **Missing Features** - Telehealth and discharge summary not implemented

---

## 🎯 **Next Steps**

1. **Fix Critical Failures:**
   - Implement timeline export
   - Ensure complete logging coverage
   - Add patient-friendly error messages

2. **Fix High-Priority Gaps:**
   - Add rate limiting
   - Add outage detection
   - Create runbooks

3. **Implement Missing Features:**
   - Telehealth with failure handling
   - Discharge summary with reconciliation

4. **Re-run CG-5:**
   - Test all scenarios again
   - Verify fixes
   - Document evidence

---

**Last Updated:** December 2024  
**Status:** ❌ **CG-5 FAILED** - Critical fixes required before passing
