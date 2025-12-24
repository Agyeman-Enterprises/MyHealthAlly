# SLA Time Rules Implementation

**Date:** December 2024  
**Status:** ✅ **IMPLEMENTED**

---

## ⏱️ **SLA TIME RULES**

### **15 Minutes Rule**
- **Initial Response Window**
- If no response within 15 minutes → Status: **YELLOW**
- Message: "Awaiting initial response (15-minute window)"

### **30 Minutes Rule**
- **Maximum Time Before Escalation**
- If no action within 30 minutes → Status: **RED**
- Message: "Escalation Required: No action within 30 minutes"
- Triggers escalation flag

### **24 Hours Rule**
- **Standard Response Time**
- If not completed within 24 hours → Status: **YELLOW** (overdue)
- Message: "Overdue: Exceeded 24-hour standard response time"

### **72 Hours Rule**
- **Maximum Time Before Closure/Escalation**
- If not completed within 72 hours → Status: **RED** (critical)
- Message: "Critical: Exceeded 72-hour maximum response time"
- Triggers escalation flag

---

## 🎯 **PRIORITY ORDER**

1. **SLA Time Rules** (highest priority)
   - 72 hours → RED
   - 30 minutes → RED
   - 24 hours → YELLOW
   - 15 minutes → YELLOW

2. **Urgency Flags**
   - Escalation Recommended → RED
   - Emergency Redirect Sent → RED
   - Time-Sensitive → YELLOW

3. **Processing Status**
   - Terminal states → GREEN
   - In-progress states → YELLOW

---

## 📊 **HOW IT WORKS**

### **Color Calculation**

```typescript
// Priority: SLA Rules > Urgency Flag > Processing Status
const color = getSolopracticeColor(
  processingStatus,
  urgencyFlag,
  submittedAt,    // Required for SLA calculation
  lastUpdatedAt    // Required for SLA calculation
);
```

### **SLA Status Message**

```typescript
const slaStatus = getSLAStatusMessage(submittedAt, lastUpdatedAt);
// Returns: { color, message, isOverdue, requiresEscalation }
```

### **Time Until Next Threshold**

```typescript
const timeUntil = getTimeUntilNextSLAThreshold(submittedAt, lastUpdatedAt);
// Returns: { threshold, timeRemaining, isUrgent }
```

---

## 🔴 **RED STATUS TRIGGERS**

Status becomes **RED** when:
- ✅ 72 hours exceeded since submission
- ✅ 30 minutes exceeded since last update (no action)
- ✅ Urgency flag: Escalation Recommended
- ✅ Urgency flag: Emergency Redirect Sent

---

## 🟡 **YELLOW STATUS TRIGGERS**

Status becomes **YELLOW** when:
- ✅ 24 hours exceeded since submission (overdue)
- ✅ 15 minutes exceeded since last update (awaiting response)
- ✅ Urgency flag: Time-Sensitive
- ✅ In-progress processing status

---

## ✅ **GREEN STATUS TRIGGERS**

Status becomes **GREEN** when:
- ✅ Terminal processing status (Completed, Closed, etc.)
- ✅ Clinical action completed
- ✅ Follow-up scheduled

---

## 📋 **UI DISPLAY**

The `SubmissionStatusCard` component now shows:

1. **SLA Status Section** (for non-terminal items)
   - Color-coded message
   - Time remaining until next threshold
   - Escalation required badge (if needed)

2. **Metadata Section**
   - Submitted timestamp
   - Last updated timestamp
   - Assigned to
   - Estimated completion

---

## ✅ **INTEGRATION STATUS**

- ✅ SLA rules implemented
- ✅ Time-based color calculation
- ✅ Escalation detection
- ✅ Time remaining display
- ✅ UI components updated

---

**Last Updated:** December 2024  
**Status:** ✅ Fully implemented
