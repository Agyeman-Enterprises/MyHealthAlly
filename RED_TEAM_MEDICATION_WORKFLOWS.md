# Red-Team: Real-Time Medication Change Workflows

**Date:** December 2024  
**Status:** 🔴 **CRITICAL - HIGHEST RISK AREA**  
**Purpose:** Defensive rules for medication change workflows to prevent liability

---

## 🚨 **THREAT MODEL**

### **Worst-Case Scenarios**

1. **Patient reports med change → assumes it's active**
   - Patient thinks medication list is updated
   - Patient takes wrong medication
   - Adverse event occurs

2. **Hospital discharge med list is wrong**
   - Discharge list has errors
   - Errors propagated to active list
   - Patient receives wrong medication

3. **Outside provider error propagated**
   - Outside provider makes error
   - Error copied to active list
   - Patient harmed

4. **MA updates chart incorrectly**
   - MA makes mistake
   - Wrong medication added
   - Patient receives wrong medication

5. **Delay causes adverse event**
   - Patient reports change
   - Change not processed in time
   - Patient continues wrong medication

6. **Plaintiff claims "real-time system"**
   - Patient assumes real-time updates
   - System not real-time
   - Liability for false expectations

---

## 🔴 **RED-TEAM RULES (MANDATORY)**

### **Rule 1: No "Real-Time" Language**

**❌ NEVER Promise:**
- "Immediate changes"
- "Automatic updates"
- "Active medication lists"
- "Real-time updates"
- "Instant processing"

**✅ ALWAYS Say:**
- "Submitted for clinician review"
- "Under review by your care team"
- "Processing may take time"
- "Your care team will review and update"
- "Review pending"

**Code Implementation:**
```typescript
// ✅ CORRECT
status: "Submitted for clinician review"
message: "Your medication change has been submitted for review. Your care team will review the documents and update your records."

// ❌ WRONG
status: "Updated"
message: "Your medication list has been updated immediately."
```

---

### **Rule 2: Dual Confirmation Barrier**

**Medication changes require:**

1. **Documented Source:**
   - Discharge note
   - Provider order
   - Prescription
   - Lab result (if applicable)

2. **Clinician Confirmation:**
   - Clinician reviews source
   - Clinician confirms change
   - Clinician updates medication list in Solopractice
   - No exceptions

**Process:**
```
Patient Reports Change
    ↓
MA/FO Uploads Document
    ↓
MA/FO Flags for Review
    ↓
Status: "Under Review"
    ↓
Clinician Reviews Source
    ↓
Clinician Confirms Change
    ↓
Clinician Updates Medication List
    ↓
Status: "Completed"
    ↓
Patient Notified
```

**❌ NO SHORTCUTS:**
- No automatic updates
- No MA/FO updates
- No patient self-updates
- No assumptions

---

### **Rule 3: MA/FO Are Firewalls**

**MA/FO Role:**
- ✅ Route to clinician
- ✅ Flag for review
- ✅ Upload documents
- ✅ Notify clinician
- ✅ Set status ("Under Review")

**MA/FO NEVER:**
- ❌ Change active medication lists
- ❌ Make clinical decisions
- ❌ Promise outcomes
- ❌ Interpret documents
- ❌ Assume changes are active

**Code Implementation:**
```kotlin
// MA/FO can only set status to "under_review"
fun flagMedicationChangeForReview(
    patientId: String,
    documentId: String,
    source: String
): Result<Unit> {
    // Upload document
    // Flag for review
    // Set status: "under_review"
    // Route to clinician
    // DO NOT update medication list
}
```

---

### **Rule 4: Time Delay Is a Safety Feature**

**Intentional delay protects you.**

**Build in:**
- ✅ Review queues
- ✅ Status labels ("Under Review", "Review Pending")
- ✅ Patient notifications clarifying review pending
- ✅ Processing time expectations

**Status Messages:**
```
"Your medication change has been submitted for clinician review."
"Processing may take time. You will be notified when your care team has reviewed and updated your records."
"Your submission is under review. Do not make changes to your medications until your care team confirms."
```

**Code Implementation:**
```typescript
// Always show processing status
const statusMessages = {
  submitted: "Submitted for clinician review",
  under_review: "Under review by your care team",
  review_pending: "Review pending - processing may take time",
  completed: "Completed - your care team has updated your records"
};
```

---

### **Rule 5: Emergency Redirect**

**If Patient Says:**
- "They changed my meds and I feel worse"
- "I'm having a reaction to the new medication"
- "I think the medication change is wrong"
- "I'm experiencing side effects"

**Immediate Response:**
1. **Emergency Guidance:**
   ```
   "If you are experiencing a medical emergency or severe reaction, 
   please call 911 immediately. MyHealthAlly cannot provide emergency medical care."
   ```

2. **Escalation:**
   - Notify clinician immediately
   - Mark as "Emergency Escalated"
   - Do not wait for business hours

3. **Documentation:**
   - Log emergency response
   - Log escalation
   - Log clinician notification
   - Timestamp all actions

**Code Implementation:**
```kotlin
fun handleMedicationEmergency(
    patientId: String,
    message: String
): Result<Unit> {
    // Check for emergency keywords
    if (containsEmergencyKeywords(message)) {
        // Send emergency guidance
        sendEmergencyGuidance(patientId)
        
        // Escalate immediately
        escalateToClinician(patientId, "MEDICATION_EMERGENCY")
        
        // Log everything
        auditLogger.logEmergencyEscalation(
            patientId = patientId,
            reason = "Medication emergency",
            message = message
        )
    }
}
```

---

### **Rule 6: Litigation Defense Logging**

**Always Log:**
- ✅ Time submitted
- ✅ Time reviewed
- ✅ Time acted
- ✅ Who acted (clinician name/ID)
- ✅ What source was used (document ID, type)
- ✅ What action was taken
- ✅ Status changes
- ✅ Patient notifications

**This wins cases.**

**Code Implementation:**
```kotlin
data class MedicationChangeLog(
    val patientId: String,
    val submittedAt: Date,
    val submittedBy: String, // "patient" or user ID
    val documentId: String?,
    val sourceType: String, // "discharge_note", "provider_order", etc.
    val reviewedAt: Date?,
    val reviewedBy: String?, // Clinician ID
    val actedAt: Date?,
    val actedBy: String?, // Clinician ID
    val action: String?, // "approved", "modified", "rejected"
    val status: String, // "submitted", "under_review", "completed"
    val patientNotifiedAt: Date?
)
```

---

## 📋 **WORKFLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────┐
│ Patient Reports Medication Change                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ MA/FO: Upload Document & Flag for Review                    │
│ Status: "Submitted for clinician review"                    │
│ Patient Notification: "Your change has been submitted..."   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Status: "Under Review"                                      │
│ Patient Notification: "Processing may take time..."         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Clinician Reviews Source Document                           │
│ Clinician Confirms Change                                   │
│ Clinician Updates Medication List in Solopractice           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Status: "Completed"                                         │
│ Patient Notification: "Your care team has updated..."       │
│ Audit Log: All actions logged with timestamps               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ **BOTTOM LINE**

**You are doing this correctly by:**

- ✅ **Routing, not acting** - MA/FO route, clinicians act
- ✅ **Coordinating, not deciding** - System coordinates, clinicians decide
- ✅ **Logging, not promising** - Everything logged, nothing promised
- ✅ **Supporting continuity, not automating medicine** - System supports, clinicians provide care

**Time delay is a safety feature, not a bug.**

**"Under Review" protects you legally.**

**Dual confirmation barrier prevents errors.**

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **Code Implementation:**
- [ ] Remove all "real-time" language
- [ ] Implement status messages ("Under Review", "Submitted for Review")
- [ ] Add dual confirmation barrier
- [ ] Prevent MA/FO from updating medication lists
- [ ] Add emergency escalation
- [ ] Implement comprehensive audit logging

### **UX Implementation:**
- [ ] Update all medication screens with correct language
- [ ] Add status indicators
- [ ] Add processing time expectations
- [ ] Add emergency guidance

### **Training:**
- [ ] Train MA/FO on firewall role
- [ ] Train clinicians on confirmation process
- [ ] Document workflows
- [ ] Create runbooks

---

**Last Updated:** December 2024  
**Status:** 🔴 CRITICAL - HIGHEST RISK AREA  
**Review Frequency:** Monthly
