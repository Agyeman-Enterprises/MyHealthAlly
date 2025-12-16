# Status Labels System - Implementation Guide

**Date:** December 2024  
**Status:** ✅ Components Ready

---

## 📦 **What's Been Created**

### **1. Type Definitions**
**File:** `pwa/lib/status-labels/types.ts`

- `ProcessingStatus` enum
- `ReviewOwnership` enum
- `ClinicalActionState` enum
- `SubmissionStatus` interface
- `StatusLabelConfig` interface

### **2. Status Configurations**
**File:** `pwa/lib/status-labels/config.ts`

- `PROCESSING_STATUS_CONFIG` - All processing status labels
- `REVIEW_OWNERSHIP_CONFIG` - All ownership labels
- `CLINICAL_ACTION_STATE_CONFIG` - All clinical action labels
- `getStatusLabelConfig()` - Helper function

### **3. UI Components**
**Files:**
- `pwa/components/status/StatusLabel.tsx` - Single status label
- `pwa/components/status/SubmissionStatusCard.tsx` - Full status card
- `pwa/components/status/StatusBadge.tsx` - Compact badge

### **4. Documentation**
**File:** `DASHBOARD_STATUS_LABELS_SYSTEM.md`

Complete documentation of the status system.

---

## 🚀 **Quick Start**

### **Basic Usage**

```tsx
import { SubmissionStatusCard } from '@/components/status/SubmissionStatusCard';
import { ProcessingStatus, ReviewOwnership, ClinicalActionState } from '@/lib/status-labels/types';

const status: SubmissionStatus = {
  processingStatus: ProcessingStatus.UNDER_REVIEW,
  reviewOwnership: ReviewOwnership.CLINICIAN_REVIEW,
  clinicalActionState: ClinicalActionState.AWAITING_REVIEW,
  submittedAt: new Date(),
  lastUpdatedAt: new Date(),
  isUrgent: false,
  requiresEscalation: false,
};

<SubmissionStatusCard
  status={status}
  title="Medication Refill Request"
  showAllDimensions={true}
/>
```

### **Patient-Facing (Simplified)**

```tsx
<SubmissionStatusCard
  status={status}
  title="Your Request"
  showAllDimensions={false} // Only show Processing Status
/>
```

### **Status Badge (Inline)**

```tsx
import { StatusBadge } from '@/components/status/StatusBadge';
import { PROCESSING_STATUS_CONFIG } from '@/lib/status-labels/config';

<StatusBadge config={PROCESSING_STATUS_CONFIG[ProcessingStatus.UNDER_REVIEW]} />
```

---

## 📋 **Integration Checklist**

### **Dashboard Pages**
- [ ] Patient dashboard - Add status cards
- [ ] Provider dashboard - Add full status cards
- [ ] MA/FO dashboard - Add ownership-focused cards

### **Message Threads**
- [ ] Show status for each message
- [ ] Show status for thread
- [ ] Show escalation flags

### **Medication Requests**
- [ ] Show refill request status
- [ ] Show medication change status
- [ ] Show approval/rejection status

### **Work Items**
- [ ] Show work item status
- [ ] Show assignment status
- [ ] Show completion status

---

## 🎨 **Customization**

### **Colors**

Colors are defined in `StatusLabel.tsx`:
- Blue: Initial/routing
- Yellow: In-progress/pending
- Green: Completed/approved
- Red: Errors/rejected/urgent
- Gray: Terminal/no action
- Purple: Clinician/admin

### **Icons**

Icons are emoji-based. To change:
1. Update `config.ts` icon field
2. Or use custom icon components

### **Sizes**

StatusLabel supports:
- `sm` - Small (text-xs)
- `md` - Medium (text-sm) - default
- `lg` - Large (text-base)

---

## ✅ **Best Practices**

### **Patient-Facing**
- Show only Processing Status
- Use simple language
- Show timestamps
- Hide internal details

### **Internal (MA/FO)**
- Show all three dimensions
- Show ownership clearly
- Show action requirements
- Show escalation flags

### **Provider**
- Show clinical action state prominently
- Show review ownership
- Show processing status
- Show all metadata

---

**Last Updated:** December 2024  
**Status:** ✅ Ready for integration
