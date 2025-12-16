# SLA Time Rules - Complete Implementation

**Date:** December 2024  
**Status:** ✅ **FULLY IMPLEMENTED**

---

## ⏱️ **SLA TIME RULES IMPLEMENTED**

### **15 Minutes Rule** ✅
- **Initial Response Window**
- If no response within 15 minutes → Status: **YELLOW**
- Message: "Awaiting initial response (15-minute window)"
- **Implemented in:** `pwa/lib/status-labels/sla-rules.ts`

### **30 Minutes Rule** ✅
- **Maximum Time Before Escalation**
- If no action within 30 minutes → Status: **RED**
- Message: "Escalation Required: No action within 30 minutes"
- Triggers escalation flag
- **Implemented in:** `pwa/lib/status-labels/sla-rules.ts`

### **24 Hours Rule** ✅
- **Standard Response Time**
- If not completed within 24 hours → Status: **YELLOW** (overdue)
- Message: "Overdue: Exceeded 24-hour standard response time"
- **Implemented in:** `pwa/lib/status-labels/sla-rules.ts`

### **72 Hours Rule** ✅
- **Maximum Time Before Closure/Escalation**
- If not completed within 72 hours → Status: **RED** (critical)
- Message: "Critical: Exceeded 72-hour maximum response time"
- Triggers escalation flag
- **Implemented in:** `pwa/lib/status-labels/sla-rules.ts`

---

## 🎯 **PRIORITY ORDER**

1. **SLA Time Rules** (highest priority)
   - 72 hours exceeded → **RED**
   - 30 minutes exceeded → **RED**
   - 24 hours exceeded → **YELLOW**
   - 15 minutes exceeded → **YELLOW**

2. **Urgency Flags**
   - Escalation Recommended → **RED**
   - Emergency Redirect Sent → **RED**
   - Time-Sensitive → **YELLOW**

3. **Processing Status**
   - Terminal states → **GREEN**
   - In-progress states → **YELLOW**

---

## 📊 **HOW IT WORKS**

### **Color Calculation**

The `getSolopracticeColor()` function now accepts timestamps and automatically applies SLA rules:

```typescript
const color = getSolopracticeColor(
  processingStatus,
  urgencyFlag,
  submittedAt,    // Required for SLA calculation
  lastUpdatedAt   // Required for SLA calculation
);
```

**Priority:**
1. SLA time rules (if timestamps provided)
2. Urgency flags
3. Processing status

### **SLA Status Message**

```typescript
const slaStatus = getSLAStatusMessage(submittedAt, lastUpdatedAt);
// Returns: { 
//   color: 'RED' | 'YELLOW' | 'GREEN',
//   message: string,
//   isOverdue: boolean,
//   requiresEscalation: boolean
// }
```

### **Time Until Next Threshold**

```typescript
const timeUntil = getTimeUntilNextSLAThreshold(submittedAt, lastUpdatedAt);
// Returns: { 
//   threshold: string,
//   timeRemaining: number (ms),
//   isUrgent: boolean
// }
```

### **Escalation Detection**

```typescript
const needsEscalation = requiresEscalation(
  submittedAt, 
  lastUpdatedAt, 
  processingStatus
);
// Returns: boolean
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

## 📱 **UI DISPLAY**

The `SubmissionStatusCard` component now shows:

1. **SLA Status Section** (for non-terminal items)
   - Color-coded message (RED/YELLOW/GREEN)
   - Time remaining until next threshold
   - Escalation required badge (if needed)

2. **Solopractice Color Indicator**
   - Shows RED/YELLOW/GREEN badge
   - Based on SLA rules + urgency flags + processing status

3. **Metadata Section**
   - Submitted timestamp
   - Last updated timestamp
   - Assigned to
   - Estimated completion

---

## ✅ **INTEGRATION STATUS**

- ✅ SLA rules implemented (`sla-rules.ts`)
- ✅ Time-based color calculation
- ✅ Escalation detection
- ✅ Time remaining display
- ✅ UI components updated
- ✅ Integrated with Solopractice color mapping

---

## 📋 **FILES CREATED/UPDATED**

1. **`pwa/lib/status-labels/sla-rules.ts`** (NEW)
   - SLA time constants
   - `calculateSLAColor()` function
   - `getSLAStatusMessage()` function
   - `getTimeUntilNextSLAThreshold()` function
   - `requiresEscalation()` function

2. **`pwa/lib/status-labels/solopractice-mapping.ts`** (UPDATED)
   - `getSolopracticeColor()` now accepts timestamps
   - Integrates SLA rules into color calculation

3. **`pwa/components/status/SubmissionStatusCard.tsx`** (UPDATED)
   - Shows SLA status section
   - Displays time remaining
   - Shows escalation badges

4. **`SLA_TIME_RULES_IMPLEMENTATION.md`** (NEW)
   - Complete documentation

---

**Last Updated:** December 2024  
**Status:** ✅ Fully implemented with 15min, 30min, 24h, 72h rules
