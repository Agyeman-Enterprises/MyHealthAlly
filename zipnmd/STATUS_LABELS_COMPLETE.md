# Status Labels System - Complete Integration

**Date:** December 2024  
**Status:** ✅ **INTEGRATED WITH SOLOPRACTICE RED/YELLOW/GREEN SYSTEM**

---

## ✅ **What's Been Integrated**

### **1. Solopractice Color Mapping** ✅
**File:** `pwa/lib/status-labels/solopractice-mapping.ts`

- Maps all statuses to RED/YELLOW/GREEN
- Priority: Urgency Flag > Processing Status
- Color classes for UI components

### **2. Updated Status Types** ✅
**File:** `pwa/lib/status-labels/types.ts`

- Processing Status aligned with Solopractice workflow
- Review Ownership simplified (MA/FO/Clinician/External)
- Clinical Action State (critical risk control)
- Medication Status (high-risk area)
- Urgency Flags (non-diagnostic)

### **3. Updated Status Configurations** ✅
**File:** `pwa/lib/status-labels/config.ts`

- All statuses have internal tooltips
- Patient-facing descriptions
- Medication-specific statuses
- Forbidden labels list

### **4. Enhanced UI Components** ✅
**File:** `pwa/components/status/SubmissionStatusCard.tsx`

- Solopractice color indicators
- Urgency flag badges
- Medication status display
- Internal tooltip warnings

---

## 🎯 **Solopractice Color System**

### **RED** 🔴
- Escalation Recommended
- Emergency Redirect Sent
- Errors

### **YELLOW** 🟡
- Received
- In Review
- Routed to Care Team
- Pending Clinician Review
- Time-Sensitive
- All in-progress states

### **GREEN** ✅
- Action Taken
- Follow-Up Scheduled
- All Closed states
- Clinical actions completed

---

## 📊 **Status Flow**

### **Processing Status (Primary)**

**YELLOW States:**
1. Received → "We've received your information"
2. In Review → "Your care team is reviewing this"
3. Routed to Care Team → "Sent to your care team for review"
4. Pending Clinician Review → "Awaiting review by licensed clinician" ⚠️ High-Value Legal Label

**GREEN States:**
5. Action Taken → "Your care team has reviewed this"
6. Follow-Up Scheduled → "Follow-up has been scheduled"
7. Closed (all variants) → Terminal states

### **Review Ownership (Secondary - Internal Only)**

- **MA Review** - Administrative intake and routing
- **FO Review** - Scheduling or insurance-related
- **Clinician Review Required** - Licensed medical decision needed
- **External Information Only** - No action required unless clinician decides otherwise

⚠️ **This prevents accidental assumption of responsibility.**

### **Clinical Action State (Critical Risk Control)**

**YELLOW:**
- No Clinical Action Taken (default state)
- Clinical Review Required

**GREEN:**
- Reviewed — No Change Recommended
- Reviewed — Follow-Up Needed
- Reviewed — Action Completed ⚠️ Never say "Medication Updated"

### **Medication Status (High-Risk Area)**

**YELLOW:**
- Medication Update Reported
- External Medication Change (Unverified)
- Pending Medication Review

**GREEN:**
- Medication Review Completed
- Medication Changes Implemented 🛑 Never display medication details here

---

## 🚨 **Urgency Flags (Non-Diagnostic)**

- **🟡 Time-Sensitive** - Requires timely review
- **🔴 Escalation Recommended** - Symptoms/language suggest urgency
- **⚠️ Emergency Redirect Sent** - Patient instructed to seek emergency care

⚠️ **These are flags, not decisions.**

---

## ✅ **Terminal States (Mandatory)**

Every item must end in one of these:

1. Closed — Information Logged
2. Closed — Reviewed by Care Team
3. Closed — Follow-Up Scheduled
4. Closed — No Action Required
5. Closed — Emergency Redirect Provided

**This prevents:**
- Open-ended liability
- "You never responded" claims
- Audit gaps

---

## 🚫 **Forbidden Labels**

The system includes a `FORBIDDEN_STATUS_LABELS` constant that prevents these phrases:

❌ Real-Time Updated  
❌ Medication Changed  
❌ Approved (use "Reviewed — Action Completed")  
❌ Diagnosed  
❌ Treated  
❌ Urgent Care Required  
❌ Safe / Unsafe  
❌ Immediate  
❌ Automatic  
❌ Instant  
❌ Active Now  

---

## 🔗 **Usage Example**

```tsx
import { SubmissionStatusCard } from '@/components/status/SubmissionStatusCard';
import { 
  ProcessingStatus, 
  ReviewOwnership, 
  ClinicalActionState,
  MedicationStatus,
  UrgencyFlag 
} from '@/lib/status-labels/types';

const status: SubmissionStatus = {
  processingStatus: ProcessingStatus.PENDING_CLINICIAN_REVIEW,
  reviewOwnership: ReviewOwnership.CLINICIAN_REVIEW_REQUIRED,
  clinicalActionState: ClinicalActionState.CLINICAL_REVIEW_REQUIRED,
  medicationStatus: MedicationStatus.PENDING_MEDICATION_REVIEW,
  urgencyFlag: UrgencyFlag.TIME_SENSITIVE,
  submittedAt: new Date(),
  lastUpdatedAt: new Date(),
};

<SubmissionStatusCard
  status={status}
  title="Medication Refill Request"
  showAllDimensions={true}
/>
```

**Result:**
- Shows YELLOW color (pending clinician review)
- Shows 🟡 Time-Sensitive flag
- Shows all three dimensions
- Shows medication status
- Shows internal tooltips with warnings

---

## ✅ **Why This System Protects MHA**

✔ Makes human review explicit  
✔ Documents deliberate timing  
✔ Avoids implied clinical action  
✔ Keeps Solopractice as system of record  
✔ Clear MA vs clinician roles  
✔ Patient sees progress, not promises  
✔ Regulator-friendly language  
✔ Plaintiff-hostile logs  
✔ Maps to Solopractice RED/YELLOW/GREEN system  
✔ Terminal states prevent open-ended liability  

---

**Last Updated:** December 2024  
**Status:** ✅ Fully integrated with Solopractice system
