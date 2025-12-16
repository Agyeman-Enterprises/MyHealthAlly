# Urgency-Based SLA Rules - Complete Implementation

**Date:** December 2024  
**Status:** ✅ **FULLY IMPLEMENTED**

---

## 🎯 **URGENCY-BASED SLA SYSTEM**

The SLA time windows are determined by the **Urgency Level**, not just elapsed time.

---

## 🔴 **EMERGENCY/URGENT (RED)**

**Examples:** Messages about chest pain, urgent symptoms

### **SLA Rules:**
- **15 minutes:** Initial response required (RED)
- **30 minutes:** Maximum time before escalation (RED, critical)
- **If not responded in 30 minutes:**
  - Alert triggered
  - Timer starts counting
  - Practice manager or MD needs to be made aware

### **Color:** RED

### **Escalation:**
- After 30 minutes → Alert practice manager or MD
- Timer shows countdown/overdue status

---

## 🟡 **NORMAL (YELLOW)**

**Examples:** AI triaged as MA-facing

### **SLA Rules:**
- **24 hours:** Must respond and close out
- **If not closed in 24 hours:**
  - Alert triggered
  - Timer starts counting
  - Practice manager needs to be made aware

### **Color:** YELLOW

### **Escalation:**
- After 24 hours → Alert practice manager
- Timer shows countdown/overdue status

---

## ✅ **ROUTINE (GREEN)**

**Examples:** All others

### **SLA Rules:**
- **72 hours:** Must close out
- **If not closed in 72 hours:**
  - Alert triggered
  - Timer starts counting
  - Practice manager or MD needs to be made aware

### **Color:** GREEN

### **Escalation:**
- After 72 hours → Alert practice manager or MD
- Timer shows countdown/overdue status

---

## 📊 **HOW IT WORKS**

### **1. Urgency Level Determines SLA Window**

```typescript
const status: SubmissionStatus = {
  urgencyLevel: UrgencyLevel.EMERGENCY, // or URGENT, NORMAL, ROUTINE
  // ...
};
```

### **2. Color Calculation**

```typescript
const color = getSolopracticeColor(
  processingStatus,
  urgencyLevel,  // PRIMARY: Determines SLA window
  urgencyFlag,
  submittedAt,
  lastUpdatedAt
);
```

**Priority:**
1. Urgency Level (determines base color and SLA window)
2. Time elapsed (determines if RED due to exceeded SLA)
3. Urgency Flags (secondary)
4. Processing Status (fallback)

### **3. Countdown Timer**

The timer automatically updates every minute and shows:
- Time remaining (or overdue time)
- Urgent status (when < 10% remaining or overdue)
- Color coding (RED if overdue, orange if urgent)

### **4. Escalation Detection**

```typescript
const escalation = requiresEscalation(
  urgencyLevel,
  submittedAt,
  lastUpdatedAt,
  processingStatus
);
// Returns: { requires: boolean, escalateTo: string[], reason: string }
```

---

## 🚨 **ESCALATION RULES**

### **EMERGENCY/URGENT:**
- **After 30 minutes:** Alert practice manager or MD
- **Timer:** Shows countdown/overdue
- **Status:** RED

### **NORMAL:**
- **After 24 hours:** Alert practice manager
- **Timer:** Shows countdown/overdue
- **Status:** YELLOW (or RED if overdue)

### **ROUTINE:**
- **After 72 hours:** Alert practice manager or MD
- **Timer:** Shows countdown/overdue
- **Status:** GREEN (or RED if overdue)

---

## 📱 **UI DISPLAY**

The `SubmissionStatusCard` now shows:

1. **Urgency Level Badge**
   - 🚨 EMERGENCY (red)
   - 🔴 URGENT (red)
   - 🟡 NORMAL (yellow)
   - ✅ ROUTINE (green)

2. **Solopractice Color Indicator**
   - 🔴 RED (if SLA exceeded or emergency/urgent)
   - 🟡 YELLOW (normal, or overdue)
   - ✅ GREEN (routine, or completed)

3. **SLA Status Section**
   - Status message with color coding
   - Countdown timer (updates every minute)
   - Overdue indicator
   - Escalation required badge
   - Alert target (practice manager/MD)

4. **Time Remaining**
   - Formatted countdown
   - Urgent warning when < 10% remaining
   - Overdue indicator when exceeded

---

## ✅ **INTEGRATION STATUS**

- ✅ Urgency Level enum added
- ✅ Urgency-based SLA rules implemented
- ✅ Countdown timer with auto-update
- ✅ Escalation detection
- ✅ Alert target identification
- ✅ UI components updated

---

## 📋 **FILES UPDATED**

1. **`pwa/lib/status-labels/types.ts`**
   - Added `UrgencyLevel` enum
   - Updated `SubmissionStatus` interface

2. **`pwa/lib/status-labels/sla-rules.ts`**
   - Complete rewrite for urgency-based rules
   - `SLA_RULES_BY_URGENCY` configuration
   - `getCountdownTimer()` function
   - `requiresEscalation()` with alert targets

3. **`pwa/lib/status-labels/solopractice-mapping.ts`**
   - Updated to use `UrgencyLevel`

4. **`pwa/components/status/SubmissionStatusCard.tsx`**
   - Urgency level badge
   - Live countdown timer
   - Escalation alerts
   - Alert target display

---

**Last Updated:** December 2024  
**Status:** ✅ Fully implemented with urgency-based SLA rules
