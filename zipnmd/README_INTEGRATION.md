# MyHealth Ally - Solopractice Integration Overview

## 🎯 Quick Summary

**MyHealth Ally interfaces with Solopractice through REST APIs. All CG rules (R1-R12) and Red Team stops are enforced server-side in Solopractice, NOT in the mobile app.**

---

## 📍 Where They Interface

### API Endpoints (Solopractice → MyHealth Ally)

| MyHealth Ally Feature | Solopractice Endpoint | CG Rules Applied |
|----------------------|----------------------|------------------|
| **Authentication** | `POST /api/portal/auth/activate` | None |
| **Send Message** | `POST /api/portal/messages/threads/[id]/messages` | R1, R2, R3 |
| **Get Messages** | `GET /api/portal/messages/threads` | R10 |
| **Request Refill** | `POST /api/portal/meds/refill-requests` | R7 |
| **Record Vitals** | `POST /api/portal/measurements` | R4, R5 |

---

## 🚨 Critical: What NOT to Do

### ❌ DO NOT Call Supabase Directly

**WRONG:**
```kotlin
// ❌ This bypasses all CG rules!
supabase.from("messages").insert(...)
```

**RIGHT:**
```kotlin
// ✅ This goes through enforcement
apiClient.sendMessage(...)  // Calls Solopractice API
```

### ❌ DO NOT Enforce Rules Client-Side

**WRONG:**
```kotlin
// ❌ Rules belong in Solopractice, not the app
if (isAfterHours()) {
    showError("Practice is closed")
}
```

**RIGHT:**
```kotlin
// ✅ Let server enforce rules
val response = apiClient.sendMessage(...)
if (response.status == "deferred") {
    showDeferred(response.nextOpenAt)
}
```

---

## ✅ How CG Rules Are Applied

### Example: Sending a Message

1. **MyHealth Ally:** User records voice message
2. **MyHealth Ally:** Collects symptom screen (for after-hours)
3. **MyHealth Ally:** Calls `POST /api/portal/messages/threads/[id]/messages`
4. **Solopractice:** Enforces R1 (Practice Hours)
5. **Solopractice:** Enforces R2 (Emergency Intercept) if after-hours
6. **Solopractice:** Enforces R3 (Deferral) if non-urgent after-hours
7. **Solopractice:** Returns response (sent, deferred, or blocked)
8. **MyHealth Ally:** Displays appropriate message to user

**Result:** All enforcement happens server-side. MyHealth Ally just displays the result.

---

## 🛡️ How Red Team Stops Work

### Stop 1: Emergency After Hours

**Requirement:** "Can it prove a patient was redirected to ED/911?"

**How:**
- MyHealth Ally sends symptom screen data
- Solopractice R2 detects emergency → blocks message
- Returns `403` with `action: "redirect_emergency"`
- MyHealth Ally shows 911 redirect
- **Audit log created** in Solopractice

**Proof:** Query audit logs in Solopractice

### Stop 2: After-Hours Deferral

**Requirement:** "Are after-hours messages clearly labeled?"

**How:**
- MyHealth Ally sends message after hours
- Solopractice R3 defers message
- Returns `status: "after_hours_deferred", nextOpenAt: "..."`  
- MyHealth Ally displays: "Message received after hours. Will be reviewed at [time]."
- **Audit log created**

**Proof:** Message has `status: "after_hours_deferred"` in database

---

## 📚 Full Documentation

- **Complete Guide:** `SOLOPRACTICE_INTEGRATION_GUIDE.md`
- **CG Rules Status:** `C:\DEV\Solopractice\zipnmd\CG1_COMPLETE_STATUS.md`
- **Red Team Checklist:** `C:\DEV\Solopractice\solopractice_red_team_due_diligence_checklist.md`

---

**Key Takeaway:** MyHealth Ally is a thin client. All safety rules are enforced in Solopractice. The app just displays results.
