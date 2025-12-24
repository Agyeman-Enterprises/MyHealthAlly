# MyHealth Ally - Solopractice Integration Summary
**Date:** December 2024  
**Status:** Architecture Defined

---

## 🎯 Key Principle

**MyHealth Ally is a thin client. All CG rules (R1-R12) and Red Team stops are enforced server-side in Solopractice, NOT in the mobile app.**

---

## 🔌 Integration Points

### 1. Authentication
- **Endpoint:** `POST /api/portal/auth/activate`
- **Purpose:** Activate patient account, get JWT token
- **CG Rules:** None (auth only)

### 2. Voice Messages
- **Endpoint:** `POST /api/portal/messages/threads/[id]/messages`
- **CG Rules:** R1 (Practice Hours), R2 (Emergency Intercept), R3 (Deferral)
- **Red Team Stops:** Emergency symptoms → 911 redirect, After-hours → deferral

### 3. Medication Refills
- **Endpoint:** `POST /api/portal/meds/refill-requests`
- **CG Rules:** R7 (Safety Gate)
- **Red Team Stops:** Unsafe refills blocked, patient informed

### 4. Vital Signs
- **Endpoint:** `POST /api/portal/measurements` (to be created)
- **CG Rules:** R4 (Urgency), R5 (Escalation)
- **Red Team Stops:** Critical vitals → immediate escalation

---

## 🚨 Critical Changes Required

### ❌ Remove Direct Supabase Access
**Current:** Repositories call Supabase directly  
**Problem:** Bypasses all CG rules, no enforcement, no audit logging  
**Fix:** Replace with Solopractice API calls

### ✅ Add Symptom Screen
**Required:** Before sending after-hours messages  
**Purpose:** Collect emergency symptom data for R2 enforcement  
**Implementation:** Show symptom screen, collect responses, send to Solopractice

### ✅ Handle Server Responses
**Required:** Display deferred/blocked message status  
**Purpose:** Patient transparency (R10)  
**Implementation:** Show "Message received after hours. Will be reviewed at [time]."

---

## 📋 Implementation Checklist

- [ ] Create Solopractice API client (Retrofit)
- [ ] Implement authentication flow
- [ ] Replace Supabase calls with Solopractice APIs
- [ ] Add symptom screen collection
- [ ] Handle deferred/blocked responses
- [ ] Test all CG rule enforcement
- [ ] Verify audit logs in Solopractice

---

## 📚 Documentation

- **Full Guide:** `SOLOPRACTICE_INTEGRATION_GUIDE.md`
- **CG Rules:** `C:\DEV\Solopractice\zipnmd\CG1_COMPLETE_STATUS.md`
- **Red Team Checklist:** `C:\DEV\Solopractice\solopractice_red_team_due_diligence_checklist.md`

---

**Status:** Ready for Implementation
