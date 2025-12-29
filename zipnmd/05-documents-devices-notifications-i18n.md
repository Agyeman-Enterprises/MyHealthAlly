#### 3.2.14 Documents, Devices, Notifications

```typescript
// src/schema/documents.ts
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { patients } from './patients';
import { encounters } from './encounters';
import { documentTypeEnum } from './enums';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  uploadedByUserId: uuid('uploaded_by_user_id').notNull().references(() => users.id),
  
  type: documentTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  
  storageBucket: varchar('storage_bucket', { length: 100 }).default('documents'),
  storagePath: varchar('storage_path', { length: 500 }).notNull(),
  
  encounterId: uuid('encounter_id').references(() => encounters.id),
  
  patientVisible: boolean('patient_visible').default(true),
  
  expiresAt: timestamp('expires_at'),
  
  tags: jsonb('tags').$type<string[]>().default([]),
  
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at'),
  deletedByUserId: uuid('deleted_by_user_id').references(() => users.id),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

```typescript
// src/schema/devices.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const connectedDevices = pgTable('connected_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  
  deviceType: varchar('device_type', { length: 50 }).notNull(),
  deviceName: varchar('device_name', { length: 100 }),
  
  isConnected: boolean('is_connected').default(true),
  connectedAt: timestamp('connected_at').notNull().defaultNow(),
  disconnectedAt: timestamp('disconnected_at'),
  
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  
  syncEnabled: boolean('sync_enabled').default(true),
  lastSyncAt: timestamp('last_sync_at'),
  lastSyncStatus: varchar('last_sync_status', { length: 30 }),
  lastSyncError: text('last_sync_error'),
  
  syncSettings: jsonb('sync_settings').$type<{
    heartRate?: boolean;
    hrv?: boolean;
    steps?: boolean;
    sleep?: boolean;
    weight?: boolean;
    bloodPressure?: boolean;
    glucose?: boolean;
    spo2?: boolean;
  }>().default({
    heartRate: true,
    hrv: true,
    steps: true,
    sleep: true,
    weight: true,
  }),
  
  deviceMetadata: jsonb('device_metadata').$type<Record<string, any>>(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const deviceSyncLog = pgTable('device_sync_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectedDeviceId: uuid('connected_device_id').notNull().references(() => connectedDevices.id, { onDelete: 'cascade' }),
  
  syncedAt: timestamp('synced_at').notNull().defaultNow(),
  status: varchar('status', { length: 30 }).notNull(),
  
  recordsSynced: integer('records_synced').default(0),
  recordsSkipped: integer('records_skipped').default(0),
  
  dataTypes: jsonb('data_types').$type<string[]>().default([]),
  
  errorMessage: text('error_message'),
  errorDetails: jsonb('error_details'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

```typescript
// src/schema/notifications.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { notificationTypeEnum, languageEnum } from './enums';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  type: notificationTypeEnum('type').notNull(),
  
  // Content in user's preferred language
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  language: languageEnum('language').notNull().default('en'),
  
  actionUrl: varchar('action_url', { length: 500 }),
  actionData: jsonb('action_data').$type<Record<string, any>>(),
  
  channels: jsonb('channels').$type<{
    channel: string;
    sentAt: string;
    deliveredAt?: string;
    failedAt?: string;
    error?: string;
  }[]>().default([]),
  
  read: boolean('read').default(false),
  readAt: timestamp('read_at'),
  
  dismissed: boolean('dismissed').default(false),
  dismissedAt: timestamp('dismissed_at'),
  
  expiresAt: timestamp('expires_at'),
  
  sourceType: varchar('source_type', { length: 50 }),
  sourceId: uuid('source_id'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userReadIdx: index('notifications_user_read_idx').on(table.userId, table.read),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));
```

#### 3.2.15 i18n Content Storage - CRITICAL FOR MULTI-LANGUAGE

```typescript
// src/schema/i18n.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { languageEnum } from './enums';

// Static content translations (UI labels, error messages, etc.)
export const translations = pgTable('translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  namespace: varchar('namespace', { length: 50 }).notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  
  // Translations by language
  translations: jsonb('translations').$type<Record<string, string>>().notNull(),
  
  context: text('context'),
  
  needsReview: boolean('needs_review').default(false),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueKey: unique('translations_namespace_key').on(table.namespace, table.key),
}));

// Dynamic content translations (care plan items, medications, etc.)
export const contentTranslations = pgTable('content_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Source entity
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  field: varchar('field', { length: 50 }).notNull(),
  
  // Original content
  originalLanguage: languageEnum('original_language').notNull().default('en'),
  originalContent: text('original_content').notNull(),
  
  // Translations
  translations: jsonb('translations').$type<Record<string, string>>().notNull(),
  
  // Translation metadata
  autoTranslated: boolean('auto_translated').default(false),
  humanReviewed: boolean('human_reviewed').default(false),
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueEntityField: unique('content_translations_entity_field').on(table.entityType, table.entityId, table.field),
}));

// Language preferences per content type
export const userLanguagePreferences = pgTable('user_language_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  uiLanguage: languageEnum('ui_language').notNull().default('en'),
  messageLanguage: languageEnum('message_language').notNull().default('en'),
  notificationLanguage: languageEnum('notification_language').notNull().default('en'),
  carePlanLanguage: languageEnum('care_plan_language').notNull().default('en'),
  documentLanguage: languageEnum('document_language').notNull().default('en'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

## 4. Internationalization (i18n) System

### 4.1 Overview

**KEY REQUIREMENT**: Users can use the app in their preferred language AND receive content from clinicians in their language, even though clinicians author content in English.

The application supports full internationalization where:
- Users can use the app in their preferred language
- Content (care plans, messages, notifications) is delivered in their language
- Clinicians author content in English, which gets translated
- Both automatic translation and human review workflows are supported

### 4.2 Supported Languages

```typescript
// config/languages.ts
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    default: true,
  },
  ch: {
    code: 'ch',
    name: 'Chamorro',
    nativeName: 'Chamoru',
    direction: 'ltr',
    region: 'guam',
  },
  chu: {
    code: 'chu',
    name: 'Chuukese',
    nativeName: 'Chuuk',
    direction: 'ltr',
    region: 'pacific',
  },
  mh: {
    code: 'mh',
    name: 'Marshallese',
    nativeName: 'Kajin M̧ajeļ',
    direction: 'ltr',
    region: 'pacific',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    region: 'international',
  },
  fil: {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    direction: 'ltr',
    region: 'international',
  },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
```

### 4.3 Translation Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Translation Flow                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Clinician  │───▶│  Content     │───▶│  Translation         │  │
│  │   (English)  │    │  (English)   │    │  Service             │  │
│  └──────────────┘    └──────────────┘    └──────────┬───────────┘  │
│                                                      │              │
│                                                      ▼              │
│                      ┌──────────────────────────────────────────┐  │
│                      │         Translation Database              │  │
│                      │  ┌────────────────────────────────────┐  │  │
│                      │  │  content_translations table         │  │  │
│                      │  │  - entity_type, entity_id, field   │  │  │
│                      │  │  - original_content (en)           │  │  │
│                      │  │  - translations: { ch, chu, mh }   │  │  │
│                      │  └────────────────────────────────────┘  │  │
│                      └──────────────────────────────────────────┘  │
│                                                      │              │
│                                                      ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Patient    │◀───│  Content     │◀───│  Language            │  │
│  │   (Chamorro) │    │  (Chamorro)  │    │  Preference          │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 Next.js i18n Setup

```typescript
// next.config.js
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

module.exports = withNextIntl({
  // other config
});
```

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

### 4.5 Translation Files Structure

```
/messages
├── en.json           # English (source)
├── ch.json           # Chamorro
├── chu.json          # Chuukese
├── mh.json           # Marshallese
├── es.json           # Spanish
└── fil.json          # Filipino
```

### 4.6 Static Translation File Example

```json
// messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "back": "Back",
    "next": "Next",
    "done": "Done"
  },
  "auth": {
    "login": "Sign In",
    "logout": "Sign Out",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "createAccount": "Create Account",
    "welcomeBack": "Welcome back"
  },
  "nav": {
    "home": "Home",
    "analytics": "Analytics",
    "messages": "Messages",
    "schedule": "Schedule",
    "profile": "Profile"
  },
  "patient": {
    "dashboard": {
      "greeting": "Good {timeOfDay}, {name}",
      "todaySnapshot": "Today's Snapshot",
      "vitals": "Your Vitals",
      "tasks": "Today's Tasks",
      "nextAppointment": "Next Appointment",
      "messages": "Messages",
      "noTasks": "No tasks for today",
      "noAppointments": "No upcoming appointments"
    },
    "vitals": {
      "bloodPressure": "Blood Pressure",
      "heartRate": "Heart Rate",
      "hrv": "Heart Rate Variability",
      "weight": "Weight",
      "bmi": "BMI",
      "glucose": "Blood Glucose",
      "spo2": "Oxygen Saturation",
      "logVital": "Log {vitalType}",
      "lastReading": "Last: {value} {unit}",
      "trend": "{direction} {percent}% from last week",
      "abnormal": "Abnormal"
    },
    "carePlan": {
      "title": "Your Care Plan",
      "supplements": "Supplements",
      "nutrition": "Nutrition",
      "lifestyle": "Lifestyle",
      "exercise": "Exercise",
      "progress": "{completed} of {total} done",
      "markComplete": "Mark as Done"
    },
    "messages": {
      "newMessage": "New Message",
      "sendMessage": "Send",
      "typeMessage": "Type a message...",
      "voiceMessage": "Voice Message",
      "recording": "Recording...",
      "careTeam": "Care Team",
      "showOriginal": "Show original",
      "showTranslation": "Show translation",
      "translating": "Translating..."
    },
    "appointments": {
      "upcoming": "Upcoming Appointments",
      "schedule": "Schedule Appointment",
      "requestWalkIn": "Request Walk-In",
      "with": "with {clinicianName}",
      "at": "at {time}",
      "join": "Join Video Visit",
      "cancel": "Cancel Appointment"
    }
  },
  "clinician": {
    "dashboard": {
      "todaySchedule": "Today's Schedule",
      "highRiskPatients": "Patients Needing Attention",
      "pendingTasks": "Pending Tasks",
      "unreadMessages": "Unread Messages"
    },
    "patient": {
      "chart": "Patient Chart",
      "vitals": "Vitals",
      "carePlan": "Care Plan",
      "encounters": "Encounters",
      "labs": "Labs",
      "medications": "Medications"
    }
  },
  "notifications": {
    "appointmentReminder": "Reminder: Appointment with {clinicianName} {timeUntil}",
    "medicationReminder": "Time to take {medicationName}",
    "vitalReminder": "Please log your {vitalType}",
    "newMessage": "New message from {senderName}",
    "labResults": "Your lab results are ready"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "networkError": "Network error. Please try again.",
    "sessionExpired": "Your session has expired. Please sign in again."
  }
}
```

```json
// messages/ch.json (Chamorro)
{
  "common": {
    "save": "Satba",
    "cancel": "Kansela",
    "submit": "Entrega",
    "loading": "Makakarga...",
    "error": "Guaha lachi",
    "success": "Maolek",
    "back": "Tåtte",
    "next": "Sigiente",
    "done": "Matachu"
  },
  "auth": {
    "login": "Hålom",
    "logout": "Huyong",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Maleffa password?",
    "createAccount": "Fa'tinas Account",
    "welcomeBack": "Håfa adai ta'lo"
  },
  "nav": {
    "home": "Guma'",
    "analytics": "Analytics",
    "messages": "Mensåhi",
    "schedule": "Iskedula",
    "profile": "Profile"
  },
  "patient": {
    "dashboard": {
      "greeting": "Håfa adai, {name}",
      "todaySnapshot": "Pa'go na Ha'åni",
      "vitals": "Sinångan Salut-mu",
      "tasks": "Che'cho' Pa'go",
      "nextAppointment": "Sigiente na Sita",
      "messages": "Mensåhi",
      "noTasks": "Tåya' che'cho' pa'go",
      "noAppointments": "Tåya' sigiente na sita"
    },
    "vitals": {
      "bloodPressure": "Minetgot Håga'",
      "heartRate": "Tinekcha' Kurason",
      "hrv": "Variasion Tinekcha' Kurason",
      "weight": "Minakkat",
      "bmi": "BMI",
      "glucose": "Asukat gi Håga'",
      "spo2": "Oxygen",
      "logVital": "Apunta {vitalType}",
      "lastReading": "Uttimo: {value} {unit}",
      "trend": "{direction} {percent}% desde uttimo simåna",
      "abnormal": "Ti normal"
    },
    "carePlan": {
      "title": "Plånu Salut-mu",
      "supplements": "Suplemåntos",
      "nutrition": "Nutrisión",
      "lifestyle": "Estilu lina'la'",
      "exercise": "Eksisio",
      "progress": "{completed} ginen {total} matachu",
      "markComplete": "Marka Matachu"
    },
    "messages": {
      "newMessage": "Nuebu na Mensåhi",
      "sendMessage": "Hånåo",
      "typeMessage": "Taitai mensåhi...",
      "voiceMessage": "Mensåhi Båsu",
      "recording": "Ma rikotkot...",
      "careTeam": "Grupo Salut",
      "showOriginal": "Na'annok orehinat",
      "showTranslation": "Na'annok translasión",
      "translating": "Ma translate..."
    }
  },
  "notifications": {
    "appointmentReminder": "Rekuetdo: Sita yan {clinicianName} {timeUntil}",
    "medicationReminder": "Ora para un toma {medicationName}",
    "vitalReminder": "Put fabot apunta i {vitalType}-mu",
    "newMessage": "Nuebu na mensåhi ginen {senderName}",
    "labResults": "Listo i lab results-mu"
  }
}
```

### 4.7 Translation Service (NestJS)

```typescript
// src/modules/i18n/i18n.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '@/database';
import { contentTranslations, translations, messages } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { OpenAI } from 'openai';

@Injectable()
export class I18nService {
  private openai = new OpenAI();

  private languageNames: Record<string, string> = {
    en: 'English',
    ch: 'Chamorro',
    chu: 'Chuukese',
    mh: 'Marshallese',
    es: 'Spanish',
    fil: 'Filipino',
  };

  /**
   * Get translation for static UI content
   */
  async getTranslation(
    namespace: string,
    key: string,
    language: string,
  ): Promise<string | null> {
    const result = await db.query.translations.findFirst({
      where: and(
        eq(translations.namespace, namespace),
        eq(translations.key, key),
      ),
    });

    if (!result) return null;

    return result.translations[language] || result.translations['en'] || null;
  }

  /**
   * Get translation for dynamic content (care plan items, messages, etc.)
   */
  async getContentTranslation(
    entityType: string,
    entityId: string,
    field: string,
    targetLanguage: string,
  ): Promise<string | null> {
    const result = await db.query.contentTranslations.findFirst({
      where: and(
        eq(contentTranslations.entityType, entityType),
        eq(contentTranslations.entityId, entityId),
        eq(contentTranslations.field, field),
      ),
    });

    if (!result) return null;

    // Check if translation exists
    if (result.translations[targetLanguage]) {
      return result.translations[targetLanguage];
    }

    // If not, auto-translate and store
    const translated = await this.autoTranslate(
      result.originalContent,
      result.originalLanguage,
      targetLanguage,
    );

    if (translated) {
      await this.storeTranslation(
        entityType,
        entityId,
        field,
        targetLanguage,
        translated,
        true,
      );
    }

    return translated || result.originalContent;
  }

  /**
   * Auto-translate content using OpenAI
   */
  async autoTranslate(
    content: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medical translator specializing in ${this.languageNames[targetLanguage]}. 
            Translate the following healthcare content accurately while maintaining medical terminology appropriateness.
            For Pacific Island languages (Chamorro, Chuukese, Marshallese), use culturally appropriate terms.
            Keep translations patient-friendly and easy to understand.
            Only output the translation, nothing else.`,
          },
          {
            role: 'user',
            content: `Translate from ${this.languageNames[sourceLanguage]} to ${this.languageNames[targetLanguage]}:\n\n${content}`,
          },
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Translation error:', error);
      return null;
    }
  }

  /**
   * Store a translation
   */
  async storeTranslation(
    entityType: string,
    entityId: string,
    field: string,
    language: string,
    translatedContent: string,
    autoTranslated: boolean = false,
  ): Promise<void> {
    const existing = await db.query.contentTranslations.findFirst({
      where: and(
        eq(contentTranslations.entityType, entityType),
        eq(contentTranslations.entityId, entityId),
        eq(contentTranslations.field, field),
      ),
    });

    if (existing) {
      const updatedTranslations = {
        ...existing.translations,
        [language]: translatedContent,
      };

      await db
        .update(contentTranslations)
        .set({
          translations: updatedTranslations,
          autoTranslated: existing.autoTranslated || autoTranslated,
          updatedAt: new Date(),
        })
        .where(eq(contentTranslations.id, existing.id));
    } else {
      await db.insert(contentTranslations).values({
        entityType,
        entityId,
        field,
        originalLanguage: 'en',
        originalContent: translatedContent,
        translations: { [language]: translatedContent },
        autoTranslated,
      });
    }
  }

  /**
   * Translate an entire care plan for a patient
   */
  async translateCarePlanForPatient(
    carePlanId: string,
    targetLanguage: string,
  ): Promise<void> {
    const items = await db.query.carePlanItems.findMany({
      where: eq(carePlanItems.carePlanId, carePlanId),
    });

    for (const item of items) {
      await this.getContentTranslation(
        'care_plan_item',
        item.id,
        'title',
        targetLanguage,
      );

      if (item.description) {
        await this.getContentTranslation(
          'care_plan_item',
          item.id,
          'description',
          targetLanguage,
        );
      }
    }
  }

  /**
   * Get message with translation
   */
  async getMessageWithTranslation(
    messageId: string,
    targetLanguage: string,
  ): Promise<{ content: string; isTranslated: boolean }> {
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.translations?.[targetLanguage]) {
      return {
        content: message.translations[targetLanguage],
        isTranslated: message.contentLanguage !== targetLanguage,
      };
    }

    if (message.contentLanguage === targetLanguage) {
      return {
        content: message.content,
        isTranslated: false,
      };
    }

    const translated = await this.autoTranslate(
      message.content,
      message.contentLanguage,
      targetLanguage,
    );

    if (translated) {
      await db
        .update(messages)
        .set({
          translations: {
            ...message.translations,
            [targetLanguage]: translated,
          },
        })
        .where(eq(messages.id, messageId));

      return {
        content: translated,
        isTranslated: true,
      };
    }

    return {
      content: message.content,
      isTranslated: false,
    };
  }
}
```

### 4.8 React Hook for Translations

```typescript
// hooks/use-translated-content.ts
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

interface TranslatedContent {
  content: string;
  isTranslated: boolean;
  originalLanguage?: string;
}

export function useTranslatedContent(
  entityType: string,
  entityId: string,
  field: string,
  originalContent?: string,
) {
  const locale = useLocale();

  return useQuery<TranslatedContent>({
    queryKey: ['translation', entityType, entityId, field, locale],
    queryFn: async () => {
      const response = await fetch(
        `/api/translations/${entityType}/${entityId}/${field}?lang=${locale}`,
      );
      return response.json();
    },
    placeholderData: originalContent
      ? { content: originalContent, isTranslated: false }
      : undefined,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
```

### 4.9 Language Selector Component

```typescript
// components/language-selector.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = async (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    
    await fetch('/api/user/language', {
      method: 'PATCH',
      body: JSON.stringify({ language: newLocale }),
    });

    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.nativeName}</span>
              {lang.code !== 'en' && (
                <span className="text-muted-foreground text-xs">
                  ({lang.name})
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```
