# Solopractice Status Labels Integration

**Date:** December 2024  
**Status:** ✅ **INTEGRATED WITH SOLOPRACTICE RED/YELLOW/GREEN SYSTEM**

---

## 🎯 **SOLOPRACTICE COLOR MAPPING**

### **RED** 🔴
- Urgent/Escalated
- Emergency Redirect Sent
- Escalation Recommended
- Errors

### **YELLOW** 🟡
- In Progress/Pending
- Received
- In Review
- Routed to Care Team
- Pending Clinician Review
- Time-Sensitive

### **GREEN** ✅
- Complete/Closed
- Action Taken
- Follow-Up Scheduled
- All Terminal States
- Clinical Actions Completed

---

## 📊 **PROCESSING STATUS (PRIMARY)**

### **YELLOW States (In Progress)**

1. **Received**
   - Definition: Patient submission successfully logged
   - Internal Tooltip: "Awaiting staff review"
   - Patient-Facing: "We've received your information"
   - Solopractice Color: **YELLOW**

2. **In Review**
   - Definition: MA/FO is actively reviewing or routing
   - Internal Tooltip: "Administrative review in progress"
   - Patient-Facing: "Your care team is reviewing this"
   - Solopractice Color: **YELLOW**

3. **Routed to Care Team**
   - Definition: Sent to clinician or appropriate queue
   - Internal Tooltip: "Awaiting clinician review"
   - Patient-Facing: "Sent to your care team for review"
   - Solopractice Color: **YELLOW**

4. **Pending Clinician Review**
   - Definition: Awaiting licensed clinician action
   - Internal Tooltip: "⚠️ High-Value Legal Label: No clinical action taken yet"
   - Patient-Facing: "Awaiting review by your care team"
   - Solopractice Color: **YELLOW**

### **GREEN States (Complete)**

5. **Action Taken**
   - Definition: Clinician has reviewed and acted outside MHA (e.g., Solopractice)
   - Internal Tooltip: "See clinical system for details"
   - Patient-Facing: "Your care team has reviewed this"
   - Solopractice Color: **GREEN**

6. **Follow-Up Scheduled**
   - Definition: Appointment or next step arranged
   - Internal Tooltip: "Follow-up documented"
   - Patient-Facing: "Follow-up has been scheduled"
   - Solopractice Color: **GREEN**

7. **Closed** (All Variants)
   - Closed — Information Logged
   - Closed — Reviewed by Care Team
   - Closed — Follow-Up Scheduled
   - Closed — No Action Required
   - Closed — Emergency Redirect Provided
   - Solopractice Color: **GREEN**

---

## 👥 **REVIEW OWNERSHIP (SECONDARY)**

**Internal only — never patient-facing**

- **MA Review** - Administrative intake and routing
- **FO Review** - Scheduling or insurance-related
- **Clinician Review Required** - Licensed medical decision needed
- **External Information Only** - No action required unless clinician decides otherwise

⚠️ **This prevents accidental assumption of responsibility.**

---

## 🏥 **CLINICAL ACTION STATE (CRITICAL RISK CONTROL)**

**This is where lawsuits are won or lost.**

### **YELLOW States**

1. **No Clinical Action Taken**
   - Default state
   - Tooltip: "Information received. No medical decision made."
   - Solopractice Color: **YELLOW**

2. **Clinical Review Required**
   - Tooltip: "Pending licensed clinician assessment."
   - Solopractice Color: **YELLOW**

### **GREEN States**

3. **Reviewed — No Change Recommended**
   - Tooltip: "Clinician reviewed; no change indicated."
   - Solopractice Color: **GREEN**

4. **Reviewed — Follow-Up Needed**
   - Tooltip: "Further evaluation required."
   - Solopractice Color: **YELLOW** (still requires action)

5. **Reviewed — Action Completed**
   - Tooltip: "Action completed in clinical system."
   - ⚠️ **Never say "Medication Updated" here. Always defer to clinical system.**
   - Solopractice Color: **GREEN**

---

## 💊 **MEDICATION-SPECIFIC STATUS LABELS**

**High-Risk Area**

### **YELLOW States**

1. **Medication Update Reported**
   - Patient reports medication information
   - Solopractice Color: **YELLOW**

2. **External Medication Change (Unverified)**
   - Source: Hospital / outside provider
   - Solopractice Color: **YELLOW**

3. **Pending Medication Review**
   - Awaiting clinician confirmation
   - Solopractice Color: **YELLOW**

### **GREEN States**

4. **Medication Review Completed**
   - Reviewed by clinician
   - Solopractice Color: **GREEN**

5. **Medication Changes Implemented**
   - Internal Tooltip: "Implemented in Solopractice"
   - Patient-Facing: "Your care team has reviewed your medications"
   - 🛑 **Never display medication details here.**
   - Solopractice Color: **GREEN**

---

## 🚨 **URGENCY FLAGS (NON-DIAGNOSTIC)**

**Internal visual flags only — these are flags, not decisions.**

- **🟡 Time-Sensitive** - Requires timely review (YELLOW)
- **🔴 Escalation Recommended** - Symptoms/language suggest urgency (RED)
- **⚠️ Emergency Redirect Sent** - Patient instructed to seek emergency care (RED)

⚠️ **These are flags, not decisions.**

---

## ✅ **TERMINAL STATES (MANDATORY)**

**Every item must end in one of these:**

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

## 🚫 **STATUS LABELS YOU MUST NEVER USE**

❌ Real-Time Updated  
❌ Medication Changed  
❌ Approved (use "Reviewed — Action Completed" instead)  
❌ Diagnosed  
❌ Treated  
❌ Urgent Care Required  
❌ Safe / Unsafe  
❌ Immediate  
❌ Automatic  
❌ Instant  
❌ Active Now  

---

## ✅ **WHY THIS SYSTEM PROTECTS MHA**

✔ Makes human review explicit  
✔ Documents deliberate timing  
✔ Avoids implied clinical action  
✔ Keeps Solopractice as system of record  
✔ Clear MA vs clinician roles  
✔ Patient sees progress, not promises  
✔ Regulator-friendly language  
✔ Plaintiff-hostile logs  
✔ Maps to Solopractice RED/YELLOW/GREEN system  

---

## 🔗 **INTEGRATION**

### **Code Files:**
- `pwa/lib/status-labels/types.ts` - Type definitions
- `pwa/lib/status-labels/config.ts` - Status configurations
- `pwa/lib/status-labels/solopractice-mapping.ts` - Color mapping

### **Usage:**
```tsx
import { getSolopracticeColor } from '@/lib/status-labels/solopractice-mapping';

const color = getSolopracticeColor(processingStatus, urgencyFlag);
// Returns: 'RED' | 'YELLOW' | 'GREEN' | 'GRAY'
```

---

**Last Updated:** December 2024  
**Status:** ✅ Integrated with Solopractice system
