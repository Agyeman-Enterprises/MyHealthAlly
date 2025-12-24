# MyHealthAlly / Lina'la Web Application Specification

## Complete Rebuild Specification for Cursor

**Version:** 1.0
**Date:** December 2024
**Stack:** Next.js 14 (App Router) + NestJS + Drizzle ORM + Supabase PostgreSQL

---

## 1. Project Overview

### 1.1 Purpose

A comprehensive patient engagement platform transforming episodic healthcare into continuous care. Supports Remote Patient Monitoring (RPM) and Chronic Care Management (CCM) billing codes for chronic disease management including diabetes, hypertension, and obesity.

### 1.2 Brands

| Brand | Market | Practice | Languages |
|-------|--------|----------|-----------|
| **Lina'la** | Guam / Pacific Islands | Ohimaa GU Functional Medicine | English, Chamorro, Chuukese, Marshallese |
| **MyHealthAlly** | International | Bookadoc2u | English, Spanish, Filipino |

### 1.3 Key Users

- **Patients**: Chronic disease management, vitals tracking, care plan adherence
- **Clinicians**: Patient monitoring, care plan management, visit documentation
- **Care Coordinators**: Task management, outreach, billing time tracking

### 1.4 Success Metrics

- Continuous patient engagement (not episodic visits)
- BMI tracking as first-class metric (GLP-1 eligibility)
- RPM/CCM billable time capture
- Multi-language accessibility for underserved populations

---

## 2. Technology Stack

### 2.1 Frontend

```
Framework:        Next.js 14 (App Router)
Styling:          Tailwind CSS
Components:       shadcn/ui (customized)
State:            Zustand + React Query
Forms:            React Hook Form + Zod
Charts:           Recharts
i18n:             next-intl
```

### 2.2 Backend

```
Framework:        NestJS
ORM:              Drizzle
Database:         Supabase PostgreSQL
Auth:             Supabase Auth + JWT
File Storage:     Supabase Storage
Realtime:         Supabase Realtime (messages, alerts)
```

### 2.3 Design Tokens

```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    primary: '#2BA39B',
    primaryHover: '#249187',
    primaryLight: '#E8F5F3',
    primaryMuted: '#A7D5D0',
    
    surface: '#FFFFFF',
    surfaceSecondary: '#F9FAFB',
    surfaceTertiary: '#F3F4F6',
    
    text: '#1A1A1A',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',      // Default
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
  },
};
```

---

## 3. Database Schema (Drizzle)

### 3.1 Project Structure

```
/packages/database
├── drizzle.config.ts
├── src/
│   ├── index.ts              # Export all
│   ├── client.ts             # Drizzle client
│   ├── schema/
│   │   ├── index.ts
│   │   ├── enums.ts
│   │   ├── users.ts
│   │   ├── patients.ts
│   │   ├── clinicians.ts
│   │   ├── vitals.ts
│   │   ├── care-plans.ts
│   │   ├── encounters.ts
│   │   ├── messages.ts
│   │   ├── tasks.ts
│   │   ├── labs.ts
│   │   ├── medications.ts
│   │   ├── alerts.ts
│   │   ├── billing.ts
│   │   ├── documents.ts
│   │   ├── devices.ts
│   │   ├── notifications.ts
│   │   └── i18n.ts
│   ├── relations.ts
│   └── types.ts
└── drizzle/
    └── migrations/
```

### 3.2 Schema Definitions

#### 3.2.1 Core Enums

```typescript
// src/schema/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core';

// User & Auth
export const userRoleEnum = pgEnum('user_role', [
  'patient',
  'clinician',
  'care_coordinator',
  'admin',
]);

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'pending_verification',
  'suspended',
]);

// Languages - CRITICAL for i18n
export const languageEnum = pgEnum('language', [
  'en',    // English
  'ch',    // Chamorro
  'chu',   // Chuukese
  'mh',    // Marshallese
  'es',    // Spanish
  'fil',   // Filipino/Tagalog
]);

// Patient specific
export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
]);

export const insuranceTypeEnum = pgEnum('insurance_type', [
  'medicaid',
  'medicare',
  'private',
  'tricare',
  'cofa',      // Compact of Free Association
  'self_pay',
  'other',
]);

export const cofaStatusEnum = pgEnum('cofa_status', [
  'fsm',       // Federated States of Micronesia
  'rmi',       // Republic of Marshall Islands
  'palau',
  'not_applicable',
]);

// Vitals
export const vitalTypeEnum = pgEnum('vital_type', [
  'blood_pressure',
  'heart_rate',
  'hrv',
  'weight',
  'bmi',
  'glucose',
  'spo2',
  'temperature',
  'respiratory_rate',
  'steps',
  'sleep_hours',
  'sleep_quality',
]);

export const vitalSourceEnum = pgEnum('vital_source', [
  'manual',
  'apple_health',
  'fitbit',
  'oura',
  'garmin',
  'withings',
  'dexcom',
  'freestyle_libre',
  'omron',
  'device_other',
]);

// Care Plans
export const carePlanStatusEnum = pgEnum('care_plan_status', [
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
]);

export const carePlanSectionTypeEnum = pgEnum('care_plan_section_type', [
  'supplements',
  'nutrition',
  'lifestyle',
  'exercise',
  'labs',
  'medications',
  'mindfulness',
  'sleep',
  'other',
]);

// Encounters
export const encounterTypeEnum = pgEnum('encounter_type', [
  'initial_consult',
  'follow_up',
  'telehealth',
  'in_person',
  'walk_in',
  'urgent',
  'lab_review',
  'care_coordination',
]);

export const encounterStatusEnum = pgEnum('encounter_status', [
  'scheduled',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

// Messages
export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'voice',
  'image',
  'document',
  'system',
]);

export const messagePriorityEnum = pgEnum('message_priority', [
  'normal',
  'urgent',
  'emergency',
]);

// Tasks
export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'overdue',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const taskCategoryEnum = pgEnum('task_category', [
  'vital_check',
  'medication',
  'appointment',
  'lab_order',
  'care_plan_review',
  'patient_outreach',
  'documentation',
  'billing',
  'other',
]);

// Alerts
export const alertSeverityEnum = pgEnum('alert_severity', [
  'info',
  'low',
  'medium',
  'high',
  'critical',
]);

export const alertStatusEnum = pgEnum('alert_status', [
  'active',
  'acknowledged',
  'resolved',
  'dismissed',
]);

// Billing - RPM/CCM codes
export const billingCodeTypeEnum = pgEnum('billing_code_type', [
  'rpm_99453',    // RPM setup
  'rpm_99454',    // RPM device supply
  'rpm_99457',    // RPM first 20 min
  'rpm_99458',    // RPM additional 20 min
  'ccm_99490',    // CCM first 20 min
  'ccm_99439',    // CCM additional 20 min
  'ccm_99491',    // CCM complex first 30 min
  'pcm_99426',    // Principal care mgmt first 30 min
  'pcm_99427',    // PCM additional 30 min
]);

// Labs
export const labStatusEnum = pgEnum('lab_status', [
  'ordered',
  'scheduled',
  'collected',
  'processing',
  'resulted',
  'reviewed',
  'cancelled',
]);

// Documents
export const documentTypeEnum = pgEnum('document_type', [
  'insurance_card',
  'id',
  'lab_result',
  'imaging',
  'referral',
  'consent',
  'intake_form',
  'other',
]);

// Notifications
export const notificationTypeEnum = pgEnum('notification_type', [
  'appointment_reminder',
  'medication_reminder',
  'vital_reminder',
  'lab_result',
  'message',
  'care_plan_update',
  'alert',
  'billing',
  'system',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'in_app',
  'push',
  'sms',
  'email',
]);
```
