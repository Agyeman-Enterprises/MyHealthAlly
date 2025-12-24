# MyHealthAlly (MHA) - Patient App Specification

## SCOPE: MHA ONLY

**Version:** 5.0  
**Date:** December 2024  
**Focus:** Patient-facing app + API contract with SoloPractice

---

## 1. WHAT MHA IS

### 1.1 Definition

**MyHealthAlly is the patient-facing app that:**
- Lets patients communicate with their practice in ANY language
- Lets patients log vitals, request refills, book appointments
- Receives responses from practice (translated to patient's language)
- Works on iOS, Android, and PWA

**MyHealthAlly is NOT:**
- ❌ An EMR (that's SoloPractice)
- ❌ A clinical documentation system (that's ScribeMD)
- ❌ A billing system
- ❌ A lab ordering system

### 1.2 The Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   PATIENT                          API                           PRACTICE   │
│   (MHA App)                     CONTRACT                      (SoloPractice)│
│                                                                              │
│   ┌──────────┐              ┌──────────────┐              ┌──────────────┐  │
│   │          │              │              │              │              │  │
│   │  iOS     │              │  HTTPS/JSON  │              │  SP Backend  │  │
│   │  Android │─────────────▶│  + JWT Auth  │─────────────▶│  + Dashboard │  │
│   │  PWA     │◀─────────────│              │◀─────────────│              │  │
│   │          │              │              │              │              │  │
│   └──────────┘              └──────────────┘              └──────────────┘  │
│                                                                              │
│   MHA owns:                  Contract defines:            SP owns:          │
│   • Patient UI               • Endpoints                  • Enforcement     │
│   • Local storage            • Request/Response           • Data storage    │
│   • Offline queue            • Auth tokens                • Business logic  │
│   • Voice recording          • Error codes                • Provider tools  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MHA FEATURES

### 2.1 Core Features (Phase 1 - EXISTS)

| Feature | Status | Description |
|---------|--------|-------------|
| **Authentication** | ✅ Built | PIN + biometric login |
| **Dashboard** | ✅ Built | Stats, quick actions, streaks |
| **Voice Messages** | ✅ Built | Record, send to practice |
| **Message Inbox** | ✅ Built | View threads, read messages |
| **Navigation** | ✅ Built | 24 screens, bottom nav |

### 2.2 Integration Features (Phase 2 - TO BUILD)

| Feature | Status | Description |
|---------|--------|-------------|
| **Vital Logging** | 🔄 Needs API | Log BP, glucose, weight → SP |
| **Medication List** | 🔄 Needs API | View meds from SP |
| **Refill Requests** | 🔄 Needs API | One-tap refill → SP |
| **Appointments** | 🔄 Needs API | View, request, book |
| **Lab Results** | 🔄 Needs API | View results from SP |
| **Care Plan** | 🔄 Needs API | View care plan from SP |
| **Documents** | 🔄 Needs API | Upload documents to SP |

### 2.3 Advanced Features (Phase 3 - FUTURE)

| Feature | Status | Description |
|---------|--------|-------------|
| **Translation** | 📋 Spec'd | Any language ↔ English |
| **Device Sync** | 📋 Spec'd | Apple Health, Health Connect |
| **Caregiver Access** | 📋 Spec'd | Family member proxy |
| **Hospital Mode** | 📋 Spec'd | Admission notification + summary |
| **Telehealth** | 📋 Spec'd | Join video visits |

---

## 3. THE MOAT: TRANSLATION LAYER

### 3.1 How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRANSLATION FLOW (THE MOAT)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PATIENT → PRACTICE                                                          │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  1. Patient records voice message in Korean:                                 │
│     "저는 두통이 있어요. 3일 동안 계속됐어요."                                 │
│                                                                              │
│  2. MHA sends to SP API:                                                     │
│     POST /api/portal/messages                                                │
│     {                                                                        │
│       "audioUrl": "https://storage.../audio.m4a",                           │
│       "audioTranscript": "저는 두통이 있어요. 3일 동안 계속됐어요.",          │
│       "detectedLanguage": "ko"                                               │
│     }                                                                        │
│                                                                              │
│  3. SP Translation Layer (server-side):                                      │
│     - Detects language: Korean                                               │
│     - Translates to English: "I have a headache. It's been going on for     │
│       3 days."                                                               │
│     - Stores BOTH original and translation                                   │
│                                                                              │
│  4. SP Provider Dashboard shows:                                             │
│     ┌────────────────────────────────────────────────────────────────────┐  │
│     │ Patient: Maria Santos (Korean speaker)                              │  │
│     │ Original: 저는 두통이 있어요. 3일 동안 계속됐어요.                   │  │
│     │ Translation: "I have a headache. It's been going on for 3 days."   │  │
│     │ Confidence: 94%                                                     │  │
│     └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════   │
│  PRACTICE → PATIENT                                                          │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  5. Provider responds in English:                                            │
│     "Take ibuprofen 400mg every 6 hours. If headache persists after         │
│      3 days, please schedule an appointment."                                │
│                                                                              │
│  6. SP Translation Layer (server-side):                                      │
│     - Patient's preferred language: Korean                                   │
│     - Translates to Korean: "이부프로펜 400mg을 6시간마다 복용하세요.        │
│       두통이 3일 후에도 계속되면 예약을 잡아주세요."                          │
│                                                                              │
│  7. MHA receives and displays in Korean:                                     │
│     ┌────────────────────────────────────────────────────────────────────┐  │
│     │ 의사 응답:                                                          │  │
│     │ 이부프로펜 400mg을 6시간마다 복용하세요.                             │  │
│     │ 두통이 3일 후에도 계속되면 예약을 잡아주세요.                        │  │
│     │                                                                     │  │
│     │ [Show original English ▼]                                          │  │
│     └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Supported Languages

**ANY language that GPT-4/Whisper supports (100+)**

Priority languages for validation/QA:

| Region | Languages |
|--------|-----------|
| **Pacific Islands** | Chamorro, Chuukese, Marshallese, Palauan, Yapese, Kosraean, Pohnpeian |
| **Asian** | Korean, Vietnamese, Chinese (Simplified/Traditional), Japanese, Tagalog, Filipino |
| **Other** | Spanish, French, Portuguese, Russian, Arabic, Hindi, German |

### 3.3 MHA Translation Responsibilities

**MHA does:**
- ✅ Record audio (any language)
- ✅ Send audio to SP for transcription
- ✅ Display translated responses from SP
- ✅ Store patient's preferred language locally
- ✅ Send preferred language with requests

**SP does:**
- ✅ Transcribe audio (Whisper)
- ✅ Detect language
- ✅ Translate to English (GPT-4)
- ✅ Translate responses to patient's language
- ✅ Store all translations
- ✅ Flag low-confidence translations

---

## 4. MHA DATABASE (LOCAL)

### 4.1 What MHA Stores Locally

```typescript
// MHA Local Storage (SQLite/Room on device)

// User session
interface LocalUser {
  id: string;                    // From SP JWT
  patientId: string;             // From SP JWT
  practiceId: string;            // From SP JWT
  firstName: string;
  lastName: string;
  preferredLanguage: string;     // e.g., "ko", "ch", "es"
  accessToken: string;           // JWT (encrypted)
  refreshToken: string;          // Refresh token (encrypted)
  pinHash: string;               // SHA-256 of PIN
  biometricEnabled: boolean;
}

// Cached data (synced from SP)
interface CachedMedications {
  medications: Medication[];
  lastSyncedAt: Date;
}

interface CachedAppointments {
  appointments: Appointment[];
  lastSyncedAt: Date;
}

interface CachedMessages {
  threads: MessageThread[];
  lastSyncedAt: Date;
}

// Offline queue (actions pending sync)
interface OfflineQueue {
  actions: QueuedAction[];
}

interface QueuedAction {
  id: string;
  type: 'message' | 'vital' | 'refill_request' | 'appointment_request';
  payload: any;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

// Voice recordings (pending upload)
interface PendingRecordings {
  recordings: {
    id: string;
    filePath: string;
    duration: number;
    createdAt: Date;
    uploaded: boolean;
  }[];
}
```

### 4.2 What MHA Does NOT Store

- ❌ Full medical records
- ❌ Lab results (fetched on demand)
- ❌ Documents (fetched on demand)
- ❌ Other patients' data
- ❌ Provider information

---

## 5. API CONTRACT: MHA ↔ SOLOPRACTICE

### 5.1 Authentication

```typescript
// ════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ════════════════════════════════════════════════════════════════════════════

// Patient activation (first time setup)
// POST /api/portal/auth/activate
interface ActivateRequest {
  activationToken: string;        // From email/SMS link
}
interface ActivateResponse {
  accessToken: string;            // JWT
  refreshToken: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    preferredLanguage: string;
  };
  practice: {
    id: string;
    name: string;
    timezone: string;
  };
}

// Token refresh
// POST /api/portal/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Logout
// POST /api/portal/auth/logout
interface LogoutRequest {
  refreshToken: string;
}
```

### 5.2 Messages (Voice & Text)

```typescript
// ════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════════════════════════════════════════

// Get message threads
// GET /api/portal/messages/threads
interface GetThreadsResponse {
  threads: {
    id: string;
    subject: string;
    lastMessageAt: string;
    lastMessagePreview: string;    // Translated to patient's language
    unreadCount: number;
    status: 'open' | 'closed';
  }[];
}

// Get messages in thread
// GET /api/portal/messages/threads/{threadId}
interface GetMessagesResponse {
  thread: {
    id: string;
    subject: string;
    status: 'open' | 'closed';
  };
  messages: {
    id: string;
    senderType: 'patient' | 'provider' | 'staff';
    senderName: string;
    
    // Content (in patient's language)
    body: string;                  // Translated text
    originalBody?: string;         // Original if patient wants to see
    
    // Voice message
    audioUrl?: string;
    audioDuration?: number;
    
    // Attachments
    attachments?: {
      name: string;
      url: string;
      type: string;
    }[];
    
    createdAt: string;
    readAt?: string;
  }[];
}

// Send message
// POST /api/portal/messages/threads/{threadId}/messages
interface SendMessageRequest {
  // Text message
  body?: string;                   // In patient's language
  
  // Voice message
  audioUrl?: string;               // Uploaded audio URL
  audioTranscript?: string;        // Client-side transcript if available
  
  // Symptom screen (for R2 enforcement)
  symptomScreen?: {
    hasChestPain: boolean;
    hasDifficultyBreathing: boolean;
    hasSevereHeadache: boolean;
    hasUncontrolledBleeding: boolean;
    hasSuicidalThoughts: boolean;
    // ... other emergency symptoms
  };
  
  // Attachments
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface SendMessageResponse {
  id: string;
  status: 'sent' | 'deferred' | 'blocked';
  
  // If deferred (after hours)
  deferredUntil?: string;          // When practice opens
  deferredMessage?: string;        // "Your message will be reviewed at..."
  
  // If blocked (emergency detected)
  blockedReason?: string;
  blockedAction?: 'call_911' | 'go_to_er';
  emergencyMessage?: string;       // "Please call 911 immediately"
}

// Create new thread
// POST /api/portal/messages/threads
interface CreateThreadRequest {
  subject: string;
  body?: string;
  audioUrl?: string;
  symptomScreen?: SymptomScreen;
}
```

### 5.3 Vitals

```typescript
// ════════════════════════════════════════════════════════════════════════════
// VITALS
// ════════════════════════════════════════════════════════════════════════════

// Get recent vitals
// GET /api/portal/vitals?type={type}&days={days}
interface GetVitalsResponse {
  vitals: {
    id: string;
    type: 'blood_pressure' | 'blood_glucose' | 'weight' | 'heart_rate' | 'temperature' | 'oxygen_saturation';
    value: number;
    value2?: number;               // For BP (systolic/diastolic)
    unit: string;
    measuredAt: string;
    source: 'manual' | 'device';
    notes?: string;
  }[];
}

// Log vital
// POST /api/portal/vitals
interface LogVitalRequest {
  type: 'blood_pressure' | 'blood_glucose' | 'weight' | 'heart_rate' | 'temperature' | 'oxygen_saturation';
  value: number;
  value2?: number;                 // For BP
  unit: string;
  measuredAt: string;
  source: 'manual' | 'device';
  notes?: string;
}

interface LogVitalResponse {
  id: string;
  status: 'recorded' | 'escalated';
  
  // Urgency classification (R4)
  urgency: 'green' | 'yellow' | 'red';
  
  // If escalated (R5)
  escalated?: boolean;
  escalationMessage?: string;      // "Your reading is concerning. A provider will contact you."
  
  // Patient-facing message (translated)
  message?: string;                // "Your blood pressure has been recorded."
}
```

### 5.4 Medications

```typescript
// ════════════════════════════════════════════════════════════════════════════
// MEDICATIONS
// ════════════════════════════════════════════════════════════════════════════

// Get medications
// GET /api/portal/medications
interface GetMedicationsResponse {
  medications: {
    id: string;
    drugName: string;
    genericName?: string;
    strength: string;
    form: string;                  // "tablet", "capsule", etc.
    instructions: string;          // Translated to patient's language
    frequency: string;
    refillsRemaining: number;
    lastFilledDate?: string;
    pharmacy?: {
      name: string;
      phone: string;
      address: string;
    };
    canRequestRefill: boolean;
    refillBlockedReason?: string;  // If can't refill (e.g., needs labs)
  }[];
}

// Request refill
// POST /api/portal/medications/{medicationId}/refill
interface RequestRefillRequest {
  pharmacyId?: string;             // If changing pharmacy
  notes?: string;                  // Patient notes
}

interface RequestRefillResponse {
  status: 'submitted' | 'blocked';
  
  // If submitted
  requestId?: string;
  message?: string;                // "Refill request submitted. You'll be notified when ready."
  
  // If blocked (R7 - needs labs)
  blockedReason?: string;
  requiredLabs?: string[];         // "A1C test required before refill"
  labInstructions?: string;        // How to complete required labs
}
```

### 5.5 Appointments

```typescript
// ════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════════════════════════

// Get upcoming appointments
// GET /api/portal/appointments
interface GetAppointmentsResponse {
  appointments: {
    id: string;
    dateTime: string;
    duration: number;              // minutes
    type: string;                  // "Office Visit", "Telehealth", etc.
    providerName: string;
    location?: string;
    isTelehealth: boolean;
    telehealthUrl?: string;        // If telehealth and within join window
    status: 'scheduled' | 'confirmed' | 'cancelled';
    instructions?: string;         // Pre-visit instructions (translated)
  }[];
}

// Request appointment
// POST /api/portal/appointments/request
interface RequestAppointmentRequest {
  reason: string;                  // In patient's language
  urgency: 'routine' | 'soon' | 'urgent';
  preferredTimes?: string[];       // Preferred date/times
  prefersTelehealth?: boolean;
}

interface RequestAppointmentResponse {
  status: 'submitted' | 'deferred';
  requestId?: string;
  message?: string;                // "Your request has been received..."
  
  // If deferred (after hours)
  deferredUntil?: string;
}

// Get available slots (for self-scheduling, if enabled)
// GET /api/portal/appointments/slots?date={date}&type={type}
interface GetSlotsResponse {
  slots: {
    dateTime: string;
    duration: number;
    providerId: string;
    providerName: string;
    isTelehealth: boolean;
  }[];
}

// Book appointment (self-schedule)
// POST /api/portal/appointments
interface BookAppointmentRequest {
  slotDateTime: string;
  providerId: string;
  type: string;
  reason?: string;
}
```

### 5.6 Lab Results

```typescript
// ════════════════════════════════════════════════════════════════════════════
// LAB RESULTS
// ════════════════════════════════════════════════════════════════════════════

// Get lab results
// GET /api/portal/labs
interface GetLabResultsResponse {
  results: {
    id: string;
    testName: string;
    orderedDate: string;
    resultDate?: string;
    status: 'pending' | 'completed';
    
    // Results (if completed)
    values?: {
      component: string;           // "Glucose", "A1C", etc.
      value: string;
      unit: string;
      referenceRange: string;
      flag?: 'normal' | 'low' | 'high' | 'critical';
    }[];
    
    // Interpretation (translated to patient's language)
    interpretation?: string;
    
    // Documents
    pdfUrl?: string;               // Download link
  }[];
}
```

### 5.7 Care Plan

```typescript
// ════════════════════════════════════════════════════════════════════════════
// CARE PLAN
// ════════════════════════════════════════════════════════════════════════════

// Get care plan
// GET /api/portal/care-plan
interface GetCarePlanResponse {
  carePlan: {
    // Conditions
    conditions: {
      name: string;
      status: 'active' | 'controlled' | 'resolved';
      notes?: string;              // Translated
    }[];
    
    // Goals
    goals: {
      id: string;
      description: string;         // Translated
      targetDate?: string;
      status: 'in_progress' | 'achieved' | 'not_achieved';
      progress?: number;           // 0-100
    }[];
    
    // Instructions
    instructions: {
      category: string;            // "Diet", "Exercise", "Medications", etc.
      text: string;                // Translated
    }[];
    
    // Upcoming actions
    upcomingActions: {
      type: 'lab' | 'appointment' | 'screening' | 'vaccination';
      description: string;         // Translated
      dueDate?: string;
    }[];
  };
}
```

### 5.8 Documents

```typescript
// ════════════════════════════════════════════════════════════════════════════
// DOCUMENTS
// ════════════════════════════════════════════════════════════════════════════

// Upload document
// POST /api/portal/documents
interface UploadDocumentRequest {
  fileName: string;
  fileType: string;                // "application/pdf", "image/jpeg", etc.
  fileUrl: string;                 // Pre-uploaded to storage
  category: 'insurance_card' | 'medical_record' | 'lab_result' | 'other';
  description?: string;
}

interface UploadDocumentResponse {
  id: string;
  status: 'uploaded' | 'pending_review';
  message?: string;                // "Document received. Will be reviewed by staff."
}

// Get documents
// GET /api/portal/documents
interface GetDocumentsResponse {
  documents: {
    id: string;
    fileName: string;
    category: string;
    uploadedAt: string;
    downloadUrl: string;
  }[];
}
```

### 5.9 Profile

```typescript
// ════════════════════════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════════════════════════

// Get profile
// GET /api/portal/profile
interface GetProfileResponse {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
    preferredLanguage: string;
    preferredPharmacy?: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
  };
}

// Update profile
// PATCH /api/portal/profile
interface UpdateProfileRequest {
  email?: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  preferredLanguage?: string;
  preferredPharmacyId?: string;
}

// Update language preference
// PATCH /api/portal/profile/language
interface UpdateLanguageRequest {
  preferredLanguage: string;       // ISO 639-1 code (e.g., "ko", "vi", "ch")
}
```

### 5.10 Practice Info

```typescript
// ════════════════════════════════════════════════════════════════════════════
// PRACTICE INFO
// ════════════════════════════════════════════════════════════════════════════

// Get practice info
// GET /api/portal/practice
interface GetPracticeResponse {
  practice: {
    id: string;
    name: string;
    phone: string;
    fax?: string;
    address: string;
    
    // Hours (for patient display)
    hours: {
      day: string;
      open: string;
      close: string;
      closed: boolean;
    }[];
    
    // Current status
    isCurrentlyOpen: boolean;
    nextOpenAt?: string;           // If currently closed
    
    // Providers
    providers: {
      id: string;
      name: string;
      credentials: string;
      specialty?: string;
      photoUrl?: string;
    }[];
  };
}
```

### 5.11 Hospital Admission (Advanced)

```typescript
// ════════════════════════════════════════════════════════════════════════════
// HOSPITAL ADMISSION (Future)
// ════════════════════════════════════════════════════════════════════════════

// Notify hospital admission
// POST /api/portal/hospital-admission
interface NotifyAdmissionRequest {
  hospitalName: string;
  admissionDate: string;
  reason?: string;
  roomNumber?: string;
  emergencyContactNotified?: boolean;
}

interface NotifyAdmissionResponse {
  // Auto-generated patient summary
  summaryPdfUrl: string;           // Portable medical summary
  summaryData: {
    allergies: string[];
    medications: Medication[];
    conditions: string[];
    recentVitals: Vital[];
    emergencyContacts: EmergencyContact[];
    insuranceInfo: Insurance;
    providerContact: {
      name: string;
      phone: string;
    };
  };
  
  message: string;                 // "Your care team has been notified..."
}

// Notify discharge
// POST /api/portal/hospital-discharge
interface NotifyDischargeRequest {
  dischargeDate: string;
  dischargeSummaryUrl?: string;    // Uploaded PDF
  newMedications?: string;         // Text description
  followUpNeeded?: boolean;
}
```

---

## 6. ERROR HANDLING

### 6.1 Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;               // Translated to patient's language
    details?: any;
  };
}

// Error codes MHA must handle:
const ERROR_CODES = {
  // Auth
  'AUTH_EXPIRED': 'Token expired, refresh needed',
  'AUTH_INVALID': 'Invalid token, re-login needed',
  'AUTH_REVOKED': 'Access revoked, contact practice',
  
  // Enforcement (from SP rules)
  'EMERGENCY_DETECTED': 'Emergency symptoms detected, call 911',
  'AFTER_HOURS_DEFERRED': 'Message deferred until practice opens',
  'REFILL_BLOCKED': 'Refill requires lab work first',
  'RATE_LIMITED': 'Too many requests, slow down',
  
  // General
  'NOT_FOUND': 'Resource not found',
  'VALIDATION_ERROR': 'Invalid request data',
  'SERVER_ERROR': 'Server error, try again',
  'NETWORK_ERROR': 'No connection, will retry'
};
```

### 6.2 MHA Error Handling

```kotlin
// Android error handling example
sealed class MHAError {
    // Auth errors
    object TokenExpired : MHAError()
    object TokenInvalid : MHAError()
    object AccessRevoked : MHAError()
    
    // Enforcement responses (not really errors)
    data class EmergencyDetected(
        val message: String,
        val action: String  // "call_911" or "go_to_er"
    ) : MHAError()
    
    data class MessageDeferred(
        val until: String,
        val message: String
    ) : MHAError()
    
    data class RefillBlocked(
        val reason: String,
        val requiredLabs: List<String>
    ) : MHAError()
    
    // Network
    object NetworkError : MHAError()
    data class ServerError(val message: String) : MHAError()
}

// Handle in ViewModel
fun handleError(error: MHAError) {
    when (error) {
        is MHAError.TokenExpired -> refreshTokenOrLogout()
        is MHAError.EmergencyDetected -> showEmergencyDialog(error)
        is MHAError.MessageDeferred -> showDeferredMessage(error)
        is MHAError.RefillBlocked -> showLabRequirement(error)
        is MHAError.NetworkError -> queueForRetry()
        // ...
    }
}
```

---

## 7. OFFLINE SUPPORT

### 7.1 What Works Offline

| Feature | Offline Capability |
|---------|-------------------|
| **View cached messages** | ✅ Full |
| **View cached medications** | ✅ Full |
| **View cached appointments** | ✅ Full |
| **Record voice message** | ✅ Queued |
| **Log vital** | ✅ Queued |
| **Request refill** | ✅ Queued |
| **View lab results** | ⚠️ Only if cached |
| **Upload document** | ✅ Queued |

### 7.2 Offline Queue

```kotlin
// Offline queue management
class OfflineQueueManager(
    private val database: MHADatabase,
    private val apiClient: SoloPracticeApiClient
) {
    // Add action to queue
    suspend fun queueAction(action: QueuedAction) {
        database.offlineQueue.insert(action)
    }
    
    // Process queue when online
    suspend fun processQueue() {
        val pendingActions = database.offlineQueue.getPending()
        
        for (action in pendingActions) {
            try {
                val result = when (action.type) {
                    ActionType.MESSAGE -> apiClient.sendMessage(action.payload)
                    ActionType.VITAL -> apiClient.logVital(action.payload)
                    ActionType.REFILL -> apiClient.requestRefill(action.payload)
                    ActionType.DOCUMENT -> apiClient.uploadDocument(action.payload)
                }
                
                database.offlineQueue.markCompleted(action.id)
                
            } catch (e: Exception) {
                action.retryCount++
                action.lastError = e.message
                
                if (action.retryCount >= MAX_RETRIES) {
                    database.offlineQueue.markFailed(action.id)
                    notifyUserOfFailure(action)
                } else {
                    database.offlineQueue.update(action)
                }
            }
        }
    }
}
```

---

## 8. SP DASHBOARD REQUIREMENTS (FOR MHA)

### 8.1 What SP Dashboard Needs to Show

**MHA recommends SP build these views:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SP DASHBOARD - MHA INTEGRATION VIEWS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. PATIENT MESSAGES QUEUE                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ⚡ URGENT (3)  |  📥 NEW (12)  |  ⏳ PENDING (5)  |  ✅ RESOLVED     │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  [!] Maria Santos (Korean) - 10 min ago                   [Respond]  │  │
│  │      Original: 저는 두통이 있어요...                                  │  │
│  │      Translation: I have a headache... (94% confidence)              │  │
│  │                                                                       │  │
│  │  [ ] John Doe - 25 min ago                                [Respond]  │  │
│  │      "Need refill for my blood pressure medication"                  │  │
│  │                                                                       │  │
│  │  [!] Ana Reyes (Spanish) - 1 hr ago (AFTER HOURS)         [Respond]  │  │
│  │      Original: Tengo dolor en el pecho...                            │  │
│  │      Translation: I have chest pain... (97% confidence)             │  │
│  │      ⚠️ FLAGGED: Chest pain mentioned                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  2. REFILL REQUESTS                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Patient          | Medication        | Status      | Action         │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  John Doe         | Lisinopril 10mg   | Pending     | [Approve] [Deny]│ │
│  │  Maria Santos     | Metformin 500mg   | BLOCKED     | Labs required  │  │
│  │                     └─ Last A1C: 4 months ago (needs new)            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  3. APPOINTMENT REQUESTS                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Patient          | Reason (translated) | Urgency  | Action          │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  Kim Lee (Korean) | Follow-up for       | Routine  | [Schedule]      │  │
│  │                     diabetes management                               │  │
│  │  Ana Reyes (Span) | Chest pain - new    | URGENT   | [Schedule NOW]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  4. CRITICAL VITALS                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  🔴 RED (2)  |  🟡 YELLOW (5)  |  🟢 GREEN (all others)              │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  [🔴] John Doe - BP 185/110 - 15 min ago            [Acknowledged]   │  │
│  │       Escalation: SMS sent to Dr. Smith                              │  │
│  │                                                                       │  │
│  │  [🔴] Maria Santos - Glucose 320 mg/dL - 1 hr ago   [Call Patient]   │  │
│  │       Escalation: Awaiting provider response                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  5. TRANSLATION REVIEW (Low Confidence)                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Patient        | Original          | Proposed       | Confidence     │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  Kim Park       | 가슴이 답답해요    | My chest feels | 72%            │  │
│  │  (Korean)                             tight           [Edit] [Approve]│  │
│  │                                                                       │  │
│  │  NOTE: "답답해요" can mean tight, stuffy, or frustrated               │  │
│  │        depending on context. May need clarification.                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Response Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SP PROVIDER RESPONSE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Provider sees patient message (in English)                              │
│                                                                              │
│  2. Provider types response (in English):                                    │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │ "Take ibuprofen 400mg every 6 hours as needed for headache.     │    │
│     │  If it persists more than 3 days, please schedule a visit."    │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  3. SP automatically translates to patient's language (Korean):             │
│     ┌─────────────────────────────────────────────────────────────────┐    │
│     │ Preview (Korean):                                                │    │
│     │ 두통에 필요할 때마다 이부프로펜 400mg을 6시간마다                 │    │
│     │ 복용하세요. 3일 이상 지속되면 방문 예약을 해주세요.                │    │
│     │                                                                  │    │
│     │ Confidence: 96%                                                  │    │
│     │ [Send] [Edit Translation] [Request Human Review]                │    │
│     └─────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  4. Patient receives message in Korean in MHA app                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Fix Existing (Week 1-2)
- [ ] Fix Android security issues
- [ ] Fix placeholder values
- [ ] Fix thread management
- [ ] Test end-to-end with SP

### Phase 2: Core Integration (Week 3-6)
- [ ] Medications API integration
- [ ] Appointments API integration
- [ ] Vitals API integration
- [ ] Profile API integration

### Phase 3: Translation Layer (Week 7-10)
- [ ] Language preference in profile
- [ ] Send language with all requests
- [ ] Display translated responses
- [ ] Handle low-confidence flags

### Phase 4: Advanced Features (Week 11-14)
- [ ] Lab results display
- [ ] Care plan display
- [ ] Document upload
- [ ] Refill workflow

### Phase 5: Polish (Week 15-16)
- [ ] Offline queue improvements
- [ ] Push notifications
- [ ] iOS parity
- [ ] PWA completion

---

## 10. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Message Response Time** | <4 hours (during hours) | Time from send to response |
| **Translation Accuracy** | >95% | Community validation |
| **Offline Queue Success** | >99% | Queued actions that sync |
| **Vital Logging Rate** | >16 days/month | For RPM eligibility |
| **Refill Request Success** | >90% | Approved vs blocked |
| **App Crash Rate** | <0.1% | Crashlytics |

---

**MHA = Patient app + API contract. SP = Everything else.**

**THE MOAT: Patient speaks ANY language → SP translates → Provider sees English → Provider responds → SP translates → Patient sees their language.**
