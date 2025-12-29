# MyHealthAlly (MHA) - Coherent Architecture Specification
**Combined from 3 AI Chats - Unified Specification**

---

## 🎯 What MHA Is

**MyHealthAlly is a patient-facing communication and health management platform that:**

1. **Enables multilingual communication** - Patients can communicate in ANY language
2. **Connects patients to their practice** - Via SoloPractice backend
3. **Works across platforms** - Android native app + PWA (iOS/Web)
4. **Provides health management tools** - Vitals, medications, appointments, lab results

**MHA is NOT:**
- ❌ An EMR (that's SoloPractice)
- ❌ A clinical documentation system
- ❌ A billing system
- ❌ A lab ordering system

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MYHEALTHALLY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐              ┌──────────────┐              ┌──────────────┐│
│  │  Android App │              │  PWA (Web)   │              │  iOS (PWA)  ││
│  │  (Kotlin)    │              │  (Next.js)   │              │  (Browser)  ││
│  │              │              │              │              │              ││
│  │  ✅ Voice    │              │  ✅ Charts   │              │  ✅ Install ││
│  │  ✅ Biometric│              │  ✅ Desktop  │              │  ✅ PWA     ││
│  │  ✅ Offline  │              │  ✅ Sharing  │              │              ││
│  └──────┬───────┘              └──────┬───────┘              └──────┬───────┘│
│         │                              │                              │        │
│         └──────────────┬───────────────┴──────────────┬──────────────┘        │
│                        │                              │                        │
│                        │ HTTPS / JWT Auth             │                        │
│                        │                              │                        │
│         ┌──────────────▼──────────────────────────────▼──────────────┐        │
│         │         SOLOPRACTICE BACKEND API                           │        │
│         │  ┌──────────────────────────────────────────────────────┐  │        │
│         │  │  /api/portal/* Endpoints                             │  │        │
│         │  │  - Multi-tenant (practice_id isolation)              │  │        │
│         │  │  - CG Rules Enforcement (R1-R12)                       │  │        │
│         │  │  - Translation Layer (any language ↔ English)         │  │        │
│         │  │  - Audit Logging                                      │  │        │
│         │  └──────────────────────────────────────────────────────┘  │        │
│         │                                                             │        │
│         │  ┌──────────────────────────────────────────────────────┐  │        │
│         │  │  Provider Dashboard (SoloPractice)                  │  │        │
│         │  │  - Message queue                                     │  │        │
│         │  │  - Patient management                                │  │        │
│         │  │  - Translation review                                │  │        │
│         │  └──────────────────────────────────────────────────────┘  │        │
│         └─────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Platform Implementation

### Android Native App
- **Location:** `app/` directory
- **Tech:** Kotlin + Jetpack Compose
- **Status:** ✅ Complete
- **Features:**
  - Voice recording
  - Biometric authentication
  - Offline queue
  - Local Room database

### PWA (Progressive Web App)
- **Location:** `pwa/` directory
- **Tech:** Next.js 14 (App Router) + React + TypeScript
- **Status:** ✅ Complete (basic structure)
- **Features:**
  - Patient portal
  - Provider dashboard
  - Installable (iOS/Android)
  - Offline support

### iOS Native
- **Status:** ❌ Not implemented
- **Current:** iOS users use PWA

---

## 🔌 Backend Integration

### SoloPractice Backend API

**Base URL:** Configured via `NEXT_PUBLIC_API_BASE_URL`

**Authentication:**
- JWT tokens (access + refresh)
- Activation flow: `/api/portal/auth/activate`
- Token refresh: `/api/portal/auth/refresh`

**Core Endpoints:**
- `/api/portal/messages/*` - Messaging
- `/api/portal/vitals/*` - Vital logging
- `/api/portal/medications/*` - Medications & refills
- `/api/portal/appointments/*` - Appointments
- `/api/portal/labs/*` - Lab results
- `/api/portal/care-plan/*` - Care plan
- `/api/portal/documents/*` - Document upload
- `/api/portal/profile/*` - Patient profile

**Translation Layer (Server-Side):**
- Patient → Practice: Any language → English
- Practice → Patient: English → Patient's preferred language
- Handled by SoloPractice backend
- MHA just sends/receives translated content

---

## 🗄️ Data Storage

### Android App (Local)
- **Database:** Room (SQLite)
- **Stores:**
  - User session (JWT tokens, encrypted)
  - Cached medications, appointments, messages
  - Offline queue (pending actions)
  - Voice recordings (pending upload)
- **Does NOT store:**
  - Full medical records
  - Lab results (fetched on demand)
  - Other patients' data

### PWA (Browser)
- **Storage:** localStorage + IndexedDB
- **Stores:**
  - User session (JWT tokens, encrypted)
  - Cached data (medications, appointments)
  - Offline queue
- **Sync:** On connection, syncs with SoloPractice API

### Backend (SoloPractice)
- **Database:** PostgreSQL (managed by SoloPractice)
- **Stores:**
  - All patient data
  - Messages (original + translations)
  - Vitals, medications, appointments
  - Audit logs
  - Multi-tenant isolation (practice_id)

---

## 🌐 Translation System (The Moat)

### How It Works

**Patient → Practice:**
1. Patient records voice/text in any language (e.g., Korean)
2. MHA sends to SoloPractice: `{ audioUrl, audioTranscript, detectedLanguage: "ko" }`
3. SoloPractice:
   - Transcribes audio (Whisper)
   - Detects language
   - Translates to English (GPT-4)
   - Stores both original and translation
4. Provider sees English translation in dashboard

**Practice → Patient:**
1. Provider responds in English
2. SoloPractice:
   - Detects patient's preferred language (e.g., "ko")
   - Translates to Korean (GPT-4)
   - Stores both original and translation
3. MHA receives and displays Korean text
4. Patient can optionally view original English

### Supported Languages
- **ANY language** supported by GPT-4/Whisper (100+)
- Priority: Pacific Islands, Asian languages, Spanish, etc.

---

## 📋 Feature Set

### Phase 1: Core (✅ Complete)
- [x] Authentication (PIN + biometric)
- [x] Dashboard
- [x] Voice messages
- [x] Message inbox
- [x] Navigation (24 screens)

### Phase 2: Integration (🔄 To Build)
- [ ] Vital logging API integration
- [ ] Medication list API integration
- [ ] Refill requests API integration
- [ ] Appointments API integration
- [ ] Lab results API integration
- [ ] Care plan API integration
- [ ] Document upload API integration

### Phase 3: Advanced (📋 Future)
- [ ] Device sync (Apple Health, Health Connect)
- [ ] Caregiver access
- [ ] Hospital admission mode
- [ ] Telehealth integration

---

## 🛡️ Enforcement Rules (CG Rules)

**All enforcement happens server-side (SoloPractice):**

- **R1:** Practice hours enforcement
- **R2:** Emergency symptom detection
- **R3:** After-hours message deferral
- **R4:** Vital urgency classification
- **R5:** Critical vital escalation
- **R7:** Refill lab requirements
- **R8-R12:** Additional business rules

**MHA responsibilities:**
- Display enforcement responses (deferred, blocked, escalated)
- Show patient-facing messages
- Handle offline queue for retry

---

## 🚀 Implementation Phases

### Phase 1: Fix Critical Issues (Week 1-2)
- [ ] Fix Android security vulnerabilities
- [ ] Fix placeholder values (JWT extraction)
- [ ] Fix thread management
- [ ] Test end-to-end message flow

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
- [ ] iOS parity (if needed)
- [ ] PWA completion

---

## 📁 Project Structure

```
MyHealthAlly-1/
├── app/                    # Android native app (Kotlin)
│   ├── src/
│   │   ├── main/          # Main app code
│   │   └── test/          # Unit tests
│   └── build.gradle.kts
│
├── pwa/                    # Progressive Web App (Next.js)
│   ├── app/               # Next.js app router
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/      # Patient dashboard
│   │   ├── messages/      # Messaging
│   │   ├── provider/      # Provider dashboard
│   │   └── ...
│   ├── components/        # React components
│   ├── lib/               # Utilities, API clients
│   └── package.json
│
├── gradle.properties       # Android build config
├── settings.gradle.kts    # Android project settings
└── README.md
```

---

## 🔐 Security

- **JWT tokens:** Encrypted storage (Android: EncryptedSharedPreferences, PWA: encrypted localStorage)
- **PIN:** SHA-256 hashed, never stored plaintext
- **Biometric:** Android BiometricPrompt
- **HTTPS:** All API calls over HTTPS
- **Audit logging:** All PHI access logged server-side

---

## 📊 Success Metrics

- Message response time: <4 hours (during hours)
- Translation accuracy: >95%
- Offline queue success: >99%
- Vital logging rate: >16 days/month (RPM eligibility)
- Refill request success: >90%
- App crash rate: <0.1%

---

## 🎯 Key Principles

1. **MHA is a thin client** - Business logic in SoloPractice
2. **Translation is server-side** - SoloPractice handles all translation
3. **Multi-platform support** - Android native + PWA
4. **Offline-first** - Queue actions when offline, sync when online
5. **Multi-tenant** - Each practice has isolated data
6. **HIPAA compliant** - Audit logging, encryption, secure storage

---

**This specification combines all three AI chats into a coherent whole.**
**See ARCHITECTURE_CONFLICTS_NEED_CLARIFICATION.md for items requiring your decision.**

