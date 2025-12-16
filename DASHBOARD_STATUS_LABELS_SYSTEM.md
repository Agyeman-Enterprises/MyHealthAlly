# MyHealth Ally Dashboard Status Labels System

**Date:** December 2024  
**Status:** ✅ **PRODUCTION-READY**  
**Purpose:** Clinically safe, legally defensive, MA/FO friendly status system

---

## 🎯 **CORE DESIGN PRINCIPLES (RED TEAM)**

✅ **No clinical promises**  
✅ **No "real-time" language**  
✅ **Clear ownership at every step**  
✅ **Explicit human review**  
✅ **Time delays framed as safety**  
✅ **Every item has a terminal state**

---

## 📊 **THREE PARALLEL DIMENSIONS**

Each submission has three parallel dimensions that should be visually distinct but logically linked:

### **1. Processing Status** (Where it is in workflow)
- Shows where the item is in the workflow pipeline
- Patient-facing: "Under Review", "Submitted", "Completed"
- Internal: More granular states

### **2. Review Ownership** (Who must act)
- Shows who is responsible for the next action
- Clear assignment: "MA Review", "Clinician Review", "Unassigned"
- Prevents "nobody's responsible" scenarios

### **3. Clinical Action State** (What has or hasn't happened)
- Shows clinical decision status
- "No Clinical Action", "Approved", "Pending Labs"
- Separates workflow from clinical decisions

---

## 🏷️ **STATUS LABEL CATEGORIES**

### **Processing Status**

| Status | Label | Description | Color | Terminal |
|--------|-------|-------------|-------|----------|
| `SUBMITTED` | Submitted | Submitted for review. Processing may take time. | Blue | No |
| `RECEIVED` | Received | Received and queued for review. | Blue | No |
| `QUEUED` | Queued | In queue for review. Processing may take time. | Yellow | No |
| `UNDER_REVIEW` | Under Review | Under review by your care team. Processing may take time. | Yellow | No |
| `ROUTED` | Routed | Routed to appropriate team member for review. | Purple | No |
| `ESCALATED` | Escalated | Escalated for priority review. | Red | No |
| `COMPLETED` | Completed | Review completed by your care team. | Green | Yes |
| `CLOSED` | Closed | Item closed. No further action needed. | Gray | Yes |
| `CANCELLED` | Cancelled | Item cancelled. | Gray | Yes |
| `ERROR` | Error | An error occurred. Please contact support. | Red | No |

### **Review Ownership**

| Status | Label | Description | Color | Terminal |
|--------|-------|-------------|-------|----------|
| `UNASSIGNED` | Unassigned | Awaiting assignment to care team member. | Gray | No |
| `PENDING_ASSIGNMENT` | Pending Assignment | Awaiting assignment to care team member. | Yellow | No |
| `MA_REVIEW` | MA Review | Under review by Medical Assistant. | Blue | No |
| `FO_REVIEW` | Front Office Review | Under review by Front Office staff. | Blue | No |
| `CLINICIAN_REVIEW` | Clinician Review | Under review by licensed clinician. | Purple | No |
| `ADMIN_REVIEW` | Admin Review | Under review by administrator. | Purple | No |
| `SYSTEM_PROCESSING` | System Processing | Being processed by system. Human review will follow. | Yellow | No |
| `NO_ACTION_REQUIRED` | No Action Required | No further action needed. | Gray | Yes |

### **Clinical Action State**

| Status | Label | Description | Color | Terminal |
|--------|-------|-------------|-------|----------|
| `NO_CLINICAL_ACTION` | No Clinical Action | No clinical action has been taken yet. | Gray | No |
| `AWAITING_REVIEW` | Awaiting Clinical Review | Awaiting review by licensed clinician. | Yellow | No |
| `REVIEWED` | Reviewed | Reviewed by clinician. Decision pending. | Blue | No |
| `APPROVED` | Approved | Approved by clinician. | Green | Yes |
| `MODIFIED` | Modified | Modified by clinician. Changes pending review. | Yellow | No |
| `REJECTED` | Rejected | Rejected by clinician. | Red | Yes |
| `PENDING_APPOINTMENT` | Pending Appointment | Appointment required before action can be taken. | Yellow | No |
| `PENDING_LABS` | Pending Labs | Lab results required before action can be taken. | Yellow | No |
| `PENDING_CONSULTATION` | Pending Consultation | Consultation required before action can be taken. | Yellow | No |
| `CLINICALLY_COMPLETE` | Clinically Complete | All clinical actions completed. | Green | Yes |
| `CLINICALLY_CANCELLED` | Clinically Cancelled | Clinical action cancelled. | Gray | Yes |

---

## 🎨 **VISUAL DESIGN**

### **Color Coding**

- **Blue:** Initial states, routing, general processing
- **Yellow:** In-progress, pending, awaiting action
- **Green:** Completed, approved, successful
- **Red:** Errors, rejected, urgent/escalated
- **Gray:** Terminal states, cancelled, no action
- **Purple:** Clinician/admin review, high-priority

### **Icons**

Each status has a distinct icon for quick visual recognition:
- 📤 Submitted
- 📥 Received
- ⏳ Queued
- 👁️ Under Review
- 🔄 Routed
- ⚠️ Escalated
- ✅ Completed/Approved
- ❌ Cancelled/Rejected
- 🚨 Error

---

## 📱 **USAGE EXAMPLES**

### **Patient-Facing Dashboard**

```tsx
<SubmissionStatusCard
  status={submissionStatus}
  title="Medication Refill Request"
  showAllDimensions={false} // Only show Processing Status
/>
```

**Shows:**
- Processing Status (primary)
- Timestamps
- Urgent/Escalated flags

### **Internal Dashboard (MA/FO)**

```tsx
<SubmissionStatusCard
  status={submissionStatus}
  title="Medication Refill Request"
  showAllDimensions={true} // Show all three dimensions
/>
```

**Shows:**
- Processing Status
- Review Ownership (who needs to act)
- Clinical Action State
- Full metadata

### **Status Badge (Inline)**

```tsx
<StatusBadge config={processingStatusConfig} />
```

**Use for:**
- Lists
- Tables
- Compact views

---

## 🔒 **LEGAL DEFENSIBILITY**

### **Key Phrases (Always Use)**

✅ "Processing may take time"  
✅ "Under review by your care team"  
✅ "Submitted for review"  
✅ "Awaiting review by licensed clinician"  
✅ "Human review will follow"

### **Never Use**

❌ "Immediate"  
❌ "Real-time"  
❌ "Automatic"  
❌ "Instant"  
❌ "Active now"

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Code Implementation**
- [x] Status types defined
- [x] Status configurations created
- [x] StatusLabel component
- [x] SubmissionStatusCard component
- [x] StatusBadge component
- [ ] Integrate into dashboard pages
- [ ] Integrate into message threads
- [ ] Integrate into medication requests
- [ ] Integrate into refill requests

### **Testing**
- [ ] Test all status combinations
- [ ] Test terminal states
- [ ] Test urgent/escalated flags
- [ ] Test patient-facing vs internal views
- [ ] Test responsive design

### **Documentation**
- [x] Status system documented
- [ ] MA/FO training materials
- [ ] Patient-facing help text
- [ ] API documentation

---

## 🎯 **INTEGRATION POINTS**

### **Patient Dashboard**
- Show Processing Status only
- Hide internal ownership details
- Show timestamps
- Show estimated completion (if available)

### **Provider Dashboard**
- Show all three dimensions
- Show assignment details
- Show escalation flags
- Show action buttons

### **MA/FO Dashboard**
- Show Review Ownership prominently
- Show what action is needed
- Show routing information
- Show escalation requirements

---

## ✅ **COMPLIANCE**

### **Red Team Rules**
- ✅ No clinical promises
- ✅ No "real-time" language
- ✅ Clear ownership
- ✅ Explicit human review
- ✅ Time delays framed as safety
- ✅ Terminal states for all items

### **Legal Defensibility**
- ✅ Clear status progression
- ✅ Ownership documented
- ✅ Timestamps logged
- ✅ No false promises
- ✅ Patient expectations managed

---

**Last Updated:** December 2024  
**Status:** ✅ Production-ready, integration pending
