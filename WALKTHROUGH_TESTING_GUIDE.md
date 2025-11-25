# 🧪 MyHealthAlly Walkthrough Testing Guide

## How to Test Together

1. **Start the app** (if not running):
   ```bash
   cd packages/web && npm run dev
   ```
   App should be at: http://localhost:3000

2. **Start the backend** (if not running):
   ```bash
   cd packages/backend && npm run dev
   ```
   Backend should be at: http://localhost:3001

3. **We'll go through each section systematically** and I'll fix issues as we find them.

---

## 📋 Testing Checklist

### Phase 1: Public Pages (No Login Required)

#### 1. Marketing Landing Page (`/marketing`)
- [ ] Page loads at http://localhost:3000/marketing
- [ ] Logo displays correctly
- [ ] Header has "Patient Login" and "Clinician Login" buttons
- [ ] "Get Started" button links to `/patient/login`
- [ ] All sections render (Hero, Features, etc.)
- [ ] Footer links work
- [ ] **Issues Found:** ________________

#### 2. Marketing Sub-pages
- [ ] `/marketing/features` - Features page
- [ ] `/marketing/clinicians` - Clinician info page
- [ ] `/marketing/terms` - Terms of service
- [ ] `/marketing/privacy` - Privacy policy
- [ ] **Issues Found:** ________________

---

### Phase 2: Login Pages

#### 3. Patient Login (`/patient/login`)
- [ ] Page loads correctly
- [ ] Styling is correct (slate/teal gradient)
- [ ] Email and password fields work
- [ ] Login button submits form
- [ ] Error messages display if login fails
- [ ] After successful login, redirects to `/patient/dashboard`
- [ ] **Issues Found:** ________________

#### 4. Clinician Login (`/login`)
- [ ] Page loads correctly
- [ ] Login form works
- [ ] After successful login, redirects to clinician dashboard
- [ ] **Issues Found:** ________________

---

### Phase 3: Patient App (After Patient Login)

#### 5. Patient Dashboard (`/patient/dashboard`)
- [ ] Dashboard loads after login
- [ ] Vitals cards display
- [ ] Voice recorder button visible
- [ ] Recent messages section works
- [ ] Navigation links work (if any)
- [ ] **Issues Found:** ________________

#### 6. Patient Navigation Pages
- [ ] `/patient/messages` - Messages page
- [ ] `/patient/voice-messages` - Voice messages list
- [ ] `/patient/voice-messages/[id]` - Voice message detail
- [ ] `/patient/profile` - Profile page
- [ ] `/patient/schedule` - Schedule page
- [ ] `/patient/labs` - Labs page
- [ ] `/patient/analytics` - Analytics page
- [ ] **Issues Found:** ________________

---

### Phase 4: Clinician App (After Clinician Login)

#### 7. Clinician Dashboard (`/clinician/dashboard`)
- [ ] Dashboard loads after login
- [ ] Sidebar navigation visible
- [ ] All 6 nav items work:
  - [ ] Dashboard → `/clinician/dashboard`
  - [ ] Patients → `/clinician/patients`
  - [ ] Triage → `/clinician/triage`
  - [ ] Tasks → `/clinician/tasks`
  - [ ] Messages → `/clinician/messages`
  - [ ] Labs → `/clinician/labs`
- [ ] Cards display correctly
- [ ] **Issues Found:** ________________

#### 8. Clinician Navigation Pages
- [ ] `/clinician/patients` - Patient list
- [ ] `/clinician/patients/[patientId]` - Patient detail
- [ ] `/clinician/chart/[patientId]` - Patient chart (EMR)
- [ ] `/clinician/triage` - Triage page
- [ ] `/clinician/tasks` - Tasks page
- [ ] `/clinician/messages` - Messages page
- [ ] `/clinician/labs` - Labs page
- [ ] `/clinician/visit/[visitId]` - Visit workspace
- [ ] **Issues Found:** ________________

---

### Phase 5: Clinic Admin Pages

#### 9. Clinic Dashboard (`/clinics/dashboard`)
- [ ] Dashboard loads
- [ ] Stats cards display
- [ ] Quick links work:
  - [ ] View All Patients → `/clinics/patients`
  - [ ] Today's Triage → `/dashboard/today`
  - [ ] Alerts → `/clinics/alerts`
  - [ ] Visit Requests → `/clinics/visits`
  - [ ] Rules Engine → `/clinics/rules`
  - [ ] Messages → `/messages`
- [ ] **Issues Found:** ________________

#### 10. Clinic Admin Pages
- [ ] `/clinics/patients` - Clinic patient list
- [ ] `/clinics/patients/[id]` - Clinic patient detail
- [ ] `/clinics/visits` - Visits management
- [ ] `/clinics/alerts` - Alerts page
- [ ] `/clinics/rules` - Rules engine
- [ ] **Issues Found:** ________________

---

### Phase 6: Cross-Navigation & Links

#### 11. Internal Links
- [ ] "Open Chart" buttons → `/clinician/chart/[patientId]`
- [ ] "View Patient" links → `/clinician/patients/[id]`
- [ ] Breadcrumbs navigate correctly
- [ ] Back buttons work
- [ ] **Issues Found:** ________________

#### 12. Logout
- [ ] Logout button clears session
- [ ] Redirects to appropriate login page
- [ ] **Issues Found:** ________________

---

### Phase 7: Route Protection

#### 13. Unauthorized Access
- [ ] Patient routes require PATIENT role
- [ ] Clinician routes require PROVIDER/MEDICAL_ASSISTANT/ADMIN role
- [ ] Unauthorized access redirects to login
- [ ] Already authenticated users redirect to dashboard
- [ ] **Issues Found:** ________________

---

## 🐛 Common Issues to Check

1. **404 Errors:**
   - Route doesn't exist
   - Route parameter mismatch
   - Missing page.tsx file

2. **Navigation Issues:**
   - Link points to wrong route
   - Missing Link component
   - Route guard blocking access

3. **Styling Issues:**
   - CSS variables instead of Tailwind
   - Missing Tailwind classes
   - Broken layout

4. **Data Loading:**
   - API calls failing
   - Missing data
   - Loading states not working

---

## 📝 Test Results Template

**Date:** _______________
**Tester:** _______________

### Summary
- Total Pages Tested: ___
- Pages Working: ___
- Pages Broken: ___
- Issues Fixed: ___

### Critical Issues
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Minor Issues
1. _________________________________________________
2. _________________________________________________

---

## 🚀 Ready to Start Testing!

**Tell me:**
1. Is the app running? (http://localhost:3000)
2. Which section should we start with? (Marketing, Login, Patient, Clinician, or Clinic Admin)
3. Any specific pages you know are broken?

Then we'll go through each page together and I'll fix issues as we find them!

