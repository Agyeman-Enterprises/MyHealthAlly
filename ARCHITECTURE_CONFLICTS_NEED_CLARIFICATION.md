# 🚨 ARCHITECTURE CONFLICTS - NEED CLARIFICATION

Before implementing, I need to resolve these conflicts from the 3 AI chats:

---

## ⚠️ CONFLICT 1: Backend Architecture

### Chat 1 & 2 (MHA Spec):
- **SoloPractice Backend** (external API)
- MHA app connects to `/api/portal/*` endpoints
- SoloPractice handles translation, enforcement, multi-tenancy
- MHA is a thin client

### Chat 3 (Global Architecture):
- **NestJS + Drizzle** (internal backend)
- Next.js app router in `packages/web`
- Backend handles "rules engine, alerts, vitals, etc."

### ❓ QUESTION:
**Which backend should I implement?**

**Option A:** Build NestJS backend that proxies to SoloPractice API
**Option B:** Build NestJS backend that replaces SoloPractice (full backend)
**Option C:** Keep SoloPractice as backend, NestJS only for web-specific features
**Option D:** Something else?

**Current State:** PWA connects to SoloPractice API (see `pwa/lib/api/`)

---

## ⚠️ CONFLICT 2: Patient App Implementation

### Chat 2 (MHA Spec):
- **Android Native App** (Kotlin/Compose) - ✅ EXISTS
- Focus on Android app features
- API contract with SoloPractice

### Chat 3 (Global Architecture):
- **Next.js PWA** with extensive patient routes:
  - `/patient/dashboard`
  - `/patient/analytics`
  - `/patient/messages`
  - `/patient/schedule`
  - `/patient/profile`
  - ... 20+ more routes
- Builder.io models for patient pages
- **Hard rule:** "Stop generating or modifying patient routes"

### ❓ QUESTION:
**Should I implement the PWA patient routes from Chat 3?**

**Option A:** Yes, implement all patient routes in PWA (Next.js)
**Option B:** No, focus only on Android app (Chat 2)
**Option C:** Both - Android for mobile, PWA for desktop/web
**Option D:** PWA routes exist but are managed by Builder.io (don't code them)

**Current State:** PWA has some patient routes (`pwa/app/dashboard`, `pwa/app/messages`, etc.)

---

## ⚠️ CONFLICT 3: Translation Layer

### Chat 1 & 2 (MHA Spec):
- **Server-side translation** (SoloPractice does it)
- Patient sends audio/text in any language
- SoloPractice translates to English for provider
- SoloPractice translates provider response to patient's language
- MHA just displays translated content

### Chat 3 (Global Architecture):
- **No mention of translation**
- Focus on routes and UI structure

### ❓ QUESTION:
**Keep server-side translation, or implement client-side?**

**Option A:** Keep server-side (SoloPractice handles it) ✅
**Option B:** Implement client-side translation in NestJS/Next.js
**Option C:** Hybrid (server-side for messages, client-side for UI)

**Current State:** No translation implementation visible in PWA

---

## ⚠️ CONFLICT 4: Database Architecture

### Chat 2 (MHA Spec):
- **Local SQLite/Room** (Android app)
- Stores: user session, cached data, offline queue
- Does NOT store: full medical records, lab results (fetched on demand)

### Chat 3 (Global Architecture):
- **Drizzle ORM** (suggests PostgreSQL/other SQL)
- Backend database for rules engine, alerts, vitals, etc.

### ❓ QUESTION:
**Are these separate databases, or should they be unified?**

**Option A:** Separate (Android: Room, Backend: PostgreSQL via Drizzle) ✅
**Option B:** Unified (all data in PostgreSQL, Android syncs)
**Option C:** Android uses Room for offline, syncs to PostgreSQL backend

**Current State:** No Drizzle/Prisma schema visible in codebase

---

## ⚠️ CONFLICT 5: Clinician App

### Chat 3 (Global Architecture):
- **Clinician routes** under `/clinician/*`
- Dashboard, patients, visits, tasks, messages, labs
- React components only
- "Only generate CLINICIAN React pages under /clinician/..."

### Chat 1 & 2 (MHA Spec):
- **No clinician app mentioned**
- Focus is on patient app + SoloPractice backend
- SoloPractice dashboard handles provider workflows

### ❓ QUESTION:
**Should I implement the clinician app from Chat 3?**

**Option A:** Yes, build clinician routes in PWA
**Option B:** No, SoloPractice dashboard handles clinicians
**Option C:** Build clinician app that connects to SoloPractice API

**Current State:** PWA has some provider routes (`pwa/app/provider/*`)

---

## ⚠️ CONFLICT 6: Project Structure

### Chat 3 (Global Architecture):
- Next.js in `packages/web`
- NestJS backend (location not specified)
- Monorepo structure suggested

### Current State:
- Next.js PWA in `pwa/` directory
- Android app in `app/` directory
- No NestJS backend visible
- No monorepo structure

### ❓ QUESTION:
**Should I restructure to match Chat 3, or keep current structure?**

**Option A:** Keep current structure (`pwa/`, `app/`)
**Option B:** Restructure to monorepo (`packages/web`, `packages/backend`)
**Option C:** Keep current, but add NestJS backend in new location

---

## 📋 SUMMARY OF QUESTIONS

1. **Backend:** SoloPractice API only, or NestJS + Drizzle backend?
2. **Patient Routes:** Implement PWA patient routes from Chat 3, or Android only?
3. **Translation:** Server-side (SoloPractice) or client-side?
4. **Database:** Separate (Room + PostgreSQL) or unified?
5. **Clinician App:** Build clinician routes in PWA, or SoloPractice handles it?
6. **Structure:** Keep current (`pwa/`, `app/`) or restructure to monorepo?

---

## 🎯 RECOMMENDED RESOLUTION (My Best Guess)

Based on current codebase and the specs:

1. **Backend:** **Option C** - Keep SoloPractice as primary backend, add NestJS for web-specific features if needed
2. **Patient Routes:** **Option C** - Both Android and PWA, but PWA routes managed by Builder.io (don't code them manually)
3. **Translation:** **Option A** - Keep server-side (SoloPractice)
4. **Database:** **Option A** - Separate (Android: Room, Backend: PostgreSQL if NestJS added)
5. **Clinician App:** **Option A** - Build clinician routes in PWA (Chat 3 is clear about this)
6. **Structure:** **Option A** - Keep current structure, add NestJS if needed

**BUT I NEED YOUR CONFIRMATION BEFORE PROCEEDING!**

---

## ✅ WHAT I CAN DO NOW (No Conflicts)

While waiting for clarification, I can:

1. ✅ Create `.env` template for PWA
2. ✅ Set up NestJS backend structure (if you confirm)
3. ✅ Implement clinician routes in PWA (Chat 3 is clear)
4. ✅ Fix any Android app issues
5. ✅ Set up Drizzle schema (if you confirm backend approach)

**Please confirm your choices for the 6 conflicts above, and I'll proceed to completion!**

