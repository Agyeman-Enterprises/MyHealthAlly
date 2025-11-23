# MyHealthAlly + Ohimaa Full Build Implementation Plan

This document outlines the complete implementation plan for the full MyHealthAlly application including clinician portal, Ohimaa content engine, and patient web upgrades.

---

## Phase 1: Schema & Backend Foundation ✅ (IN PROGRESS)

### 1.1 Database Schema Updates
- ✅ Add `LabOrder` model with status tracking
- ✅ Add `Referral` model with priority and status
- ✅ Add `ExcuseNote` model for work/school/medical documents
- ✅ Add relations to `Patient` and `Visit` models
- ✅ Add enums: `LabOrderStatus`, `ReferralPriority`, `ReferralStatus`, `ExcuseNoteType`, `ExcuseNoteStatus`
- ⏳ Regenerate Prisma client
- ⏳ Run database migration

### 1.2 Backend Services & Controllers
- ✅ Create `LabOrdersService` and `LabOrdersController`
- ✅ Create `ReferralsService` and `ReferralsController`
- ✅ Create `ExcuseNotesService` and `ExcuseNotesController`
- ✅ Register modules in `AppModule`
- ⏳ Create `GET /config/metrics` endpoint for dynamic metrics configuration
- ⏳ Create `GET /patients/me/vitals` and `POST /patients/me/vitals` endpoints
- ⏳ Create patient-facing endpoints: `/patients/me/lab-orders`, `/patients/me/lab-results`, `/patients/me/referrals`, `/patients/me/documents`

### 1.3 Documentation Updates
- ✅ Update `API_REFERENCE.md` with new endpoints
- ✅ Update `DATABASE_SCHEMA.md` with new models
- ✅ Emphasize BMI importance for GLP-1 medication tracking
- ✅ Document dynamic metrics system

---

## Phase 2: Clinician Portal (ALL PAGES)

### 2.1 Dashboard (`/clinician/dashboard`)
**File:** `packages/web/src/app/clinician/dashboard/page.tsx`

**Features:**
- Today's appointments widget
- Alerts needing review (high priority)
- Lab orders pending review
- Visit queue (upcoming virtual visits)
- Quick stats: Patients today, High-risk count, Unreviewed labs, Open tasks

**API Calls:**
- `GET /visits/provider/:providerId?status=PLANNED&startDate=today`
- `GET /alerts?status=ACTIVE&severity=CRITICAL`
- `GET /lab-orders/provider/:providerId?status=ORDERED`
- `GET /virtual-visits/active?providerId=:providerId`

---

### 2.2 Patient List (`/clinician/patients`)
**File:** `packages/web/src/app/clinician/patients/page.tsx`

**Features:**
- Table view with columns: Name, Age/Sex, Primary Dx, Risk Level, Last Visit, Next Visit
- Search by name
- Filter by: All / High Risk / Active Program / My Panel
- Click row → navigate to patient detail

**API Calls:**
- `GET /patients` (filtered by clinic)

---

### 2.3 Patient Detail (`/clinician/patients/[id]`)
**File:** `packages/web/src/app/clinician/patients/[patientId]/page.tsx`

**Tabs:**
1. **Overview**
   - Patient header (name, age, sex, avatar)
   - BMI display (critical for GLP-1 tracking)
   - Current medications
   - Allergies
   - Primary diagnosis
   - Risk level badge

2. **Vitals & Trends**
   - Current vitals snapshot
   - HRV trend chart
   - BMI trend chart
   - Blood pressure trends
   - Glucose trends

3. **Labs**
   - Lab orders table (status, ordered date, tests)
   - Lab results table (values, ranges, flags)
   - "Order Labs" button

4. **Care Plan**
   - Active care plan phases
   - Tasks checklist
   - Progress tracking

5. **Referrals**
   - List of referrals (specialty, status, date)
   - "Create Referral" button

6. **Documents**
   - List of excuse notes and medical letters
   - "Create Document" button

7. **Messages**
   - Message thread with patient

**API Calls:**
- `GET /patients/:id`
- `GET /patients/:id/measurements`
- `GET /patients/:id/care-plans`
- `GET /lab-orders/patient/:id`
- `GET /referrals/patient/:id`
- `GET /excuse-notes/patient/:id`
- `GET /messaging/threads?patientId=:id`

---

### 2.4 Care Plans (`/clinician/careplans`)
**File:** `packages/web/src/app/clinician/careplans/page.tsx`

**Features:**
- List of all care plans
- Create new care plan
- Edit existing care plan
- Multi-section categories:
  - Nutrition
  - Movement/Exercise
  - Sleep
  - Stress Management
  - Supplements
- Each section has tasks with frequency, duration, instructions

**API Calls:**
- `GET /patients/:id/care-plans`
- `POST /patients/:id/care-plans`
- `PUT /patients/:id/care-plans`

---

### 2.5 Lab Ordering Center (`/clinician/orders`)
**File:** `packages/web/src/app/clinician/orders/page.tsx`

**Features:**
- Create lab order form:
  - Select patient
  - Select lab panels (CBC, CMP, A1C, Lipid Panel, etc.)
  - Add notes
- Lab orders table with status:
  - ORDERED (yellow)
  - IN_PROGRESS (blue)
  - COMPLETED (green)
  - CANCELLED (gray)
- Filter by status
- "Send Notification" button to notify patient

**API Calls:**
- `POST /lab-orders`
- `GET /lab-orders/provider/:providerId`
- `PUT /lab-orders/:id/status`
- `POST /messaging/threads` (to send notification)

---

### 2.6 Referral Center (`/clinician/referrals`)
**File:** `packages/web/src/app/clinician/referrals/page.tsx`

**Features:**
- Create referral form:
  - Select patient
  - Select specialty (Cardiology, Endocrinology, Physical Therapy, etc.)
  - Priority (ROUTINE, URGENT, STAT)
  - Reason
  - Referred to (provider/clinic name)
  - Notes
- Referrals table with status
- "Generate PDF" button
- "Send to Patient" button

**API Calls:**
- `POST /referrals`
- `GET /referrals/provider/:providerId`
- `POST /referrals/:id/send`
- `PUT /referrals/:id/status`

---

### 2.7 Documents & Letters (`/clinician/documents`)
**File:** `packages/web/src/app/clinician/documents/page.tsx`

**Features:**
- Create document form:
  - Select patient
  - Document type: Work Excuse / School Note / Return-to-Work / Travel Clearance / General Medical Letter
  - Date range (start/end)
  - Reason
  - Restrictions (optional)
- Documents table
- "Generate PDF" button
- "Send to Patient" button

**API Calls:**
- `POST /excuse-notes`
- `GET /excuse-notes/provider/:providerId`
- `POST /excuse-notes/:id/send`

---

### 2.8 Triage Queue (`/clinician/triage`)
**File:** `packages/web/src/app/clinician/triage/page.tsx`

**Features:**
- Walk-in requests (status: NEW, severity: YELLOW/ORANGE/RED)
- Urgent messages (unread, high priority)
- Critical vitals alerts
- Abnormal lab results
- Sort by severity/priority
- Quick actions: Assign visit, Create task, Send message

**API Calls:**
- `GET /visit-requests?status=NEW`
- `GET /alerts?status=ACTIVE&severity=CRITICAL`
- `GET /messaging/unread-count`
- `GET /lab-orders?status=COMPLETED` (filter for abnormal results)

---

### 2.9 Visit Queue (`/clinician/visit-queue`)
**File:** `packages/web/src/app/clinician/visit-queue/page.tsx`

**Features:**
- Telehealth queue (virtual visits)
- List of active/waiting sessions
- Patient name, reason, wait time
- "Launch Video Visit" button → navigates to `/clinician/visit/[visitId]`

**API Calls:**
- `GET /virtual-visits/active?providerId=:providerId`
- `GET /visits/provider/:providerId?status=PLANNED&visitMode=VIRTUAL`

---

### 2.10 Settings (`/clinician/settings`)
**File:** `packages/web/src/app/clinician/settings/page.tsx`

**Features:**
- Practice profile (clinic name, address, phone, etc.)
- User management (add/edit staff)
- Provider credentials (NPI, DEA)
- Integrations (lab systems, EHR, etc.)
- Notification preferences

**API Calls:**
- `GET /clinics/:id`
- `PUT /clinics/:id`
- `GET /users?clinicId=:clinicId`
- `POST /users` (create staff)

---

## Phase 3: Ohimaa Content Engine (ALL PAGES)

### 3.1 Program Library
**Files:**
- `packages/web/src/app/content/programs/page.tsx` (list)
- `packages/web/src/app/content/programs/[id]/page.tsx` (detail)

**Features:**
- Grid/list of programs
- Each program includes:
  - Overview/description
  - Daily tasks checklist
  - Meal plans (links)
  - Exercises (links)
  - Supplements list
  - Video/image support
- Search and filter

**Data Source:** Mock data initially, later CMS/API

---

### 3.2 Meal Plan Library
**Files:**
- `packages/web/src/app/content/meal-plans/page.tsx`
- `packages/web/src/app/content/meal-plans/[id]/page.tsx`

**Features:**
- List of meal plans
- Detail view with:
  - Meal schedule
  - Recipes
  - Shopping lists
  - Nutritional info
  - Images

---

### 3.3 Exercise Library
**Files:**
- `packages/web/src/app/content/exercises/page.tsx`
- `packages/web/src/app/content/exercises/[id]/page.tsx`

**Features:**
- List of exercises
- Detail view with:
  - Instructions
  - Video/GIF
  - Sets/reps
  - Equipment needed
  - Difficulty level

---

### 3.4 Resource Pages
**Files:**
- `packages/web/src/app/content/resources/page.tsx`
- `packages/web/src/app/content/stress/page.tsx`
- `packages/web/src/app/content/sleep/page.tsx`
- `packages/web/src/app/content/hormone/page.tsx`
- `packages/web/src/app/content/gi-reset/page.tsx`
- `packages/web/src/app/content/detox/page.tsx`
- `packages/web/src/app/content/support/page.tsx`

**Features:**
- Educational content
- Articles
- Videos
- Tools/calculators
- Mobile-friendly (WebView ready)

---

## Phase 4: Patient Web Upgrades

### 4.1 BMI Integration

#### Profile Page (`/patient/profile`)
**File:** `packages/web/src/app/patient/profile/page.tsx`

**Updates:**
- Add height field (cm or inches)
- Display current BMI
- BMI trend indicator

**API Calls:**
- `PUT /patients/me` (update height)
- `GET /patients/analytics` (get BMI)

---

#### Dashboard (`/patient/dashboard`)
**File:** `packages/web/src/app/patient/dashboard/page.tsx`

**Updates:**
- Add BMI card widget
- Show current BMI and trend (up/down arrow)
- Link to analytics for full BMI graph

**API Calls:**
- `GET /patients/analytics` (get BMI)

---

#### Analytics (`/patient/analytics`)
**File:** `packages/web/src/app/patient/analytics/page.tsx`

**Updates:**
- Add BMI graph (line chart over time)
- BMI card with current value and classification (Underweight/Normal/Overweight/Obese)
- Highlight BMI importance for GLP-1 medication tracking

**API Calls:**
- `GET /patients/analytics` (includes BMI)
- `GET /config/metrics` (for dynamic metrics)

---

### 4.2 Vitals Trends Update

**File:** `packages/web/src/app/patient/analytics/page.tsx`

**Features:**
- Dynamic metric selector (dropdown)
- Graphs for:
  - BMI (line chart)
  - Weight (line chart)
  - Heart Rate (line chart)
  - Blood Pressure (dual line: systolic/diastolic)
  - HRV (line chart)
  - Custom metrics (based on config)

**API Calls:**
- `GET /config/metrics`
- `GET /patients/:id/measurements?type=:metricType`

---

### 4.3 Custom Metrics Support

**File:** `packages/web/src/app/patient/analytics/page.tsx`

**Features:**
- Fetch available metrics from `/config/metrics`
- Render input fields based on `input_type`:
  - `numeric`: Number input
  - `scale`: Slider (0-10)
  - `select`: Dropdown
- Daily check-in UI to record custom metrics
- Store in `Measurement` table with custom `type`

**API Calls:**
- `GET /config/metrics`
- `POST /patients/me/vitals` (or `POST /patients/:id/measurements`)

---

### 4.4 Labs Page Upgrade

**File:** `packages/web/src/app/patient/labs/page.tsx`

**Updates:**
- Add tabs: "Orders" and "Results"

**Orders Tab:**
- List of lab orders
- Columns: Panel Name, Ordered Date, Status
- Status badges: Ordered (yellow), In Progress (blue), Completed (green)

**Results Tab:**
- List of completed lab results
- Expandable rows showing:
  - Test name
  - Value
  - Normal range
  - Flag (Normal/High/Low)
- "View PDF" button

**API Calls:**
- `GET /patients/me/lab-orders` (or `GET /lab-orders/patient/:patientId`)
- `GET /patients/me/lab-results` (filtered from lab orders with results)

---

### 4.5 Referrals & Documents Section

**File:** `packages/web/src/app/patient/profile/page.tsx`

**Updates:**
- Add "Referrals & Documents" section

**Referrals:**
- List of referrals
- Columns: Specialty, Date, Status, Priority
- Click to view details
- "View PDF" button if available

**Documents:**
- List of excuse notes and medical letters
- Columns: Type, Date Range, Status
- "View PDF" button
- "Download" button

**API Calls:**
- `GET /patients/me/referrals` (or `GET /referrals/patient/:patientId`)
- `GET /patients/me/documents` (or `GET /excuse-notes/patient/:patientId`)

---

## Phase 5: Backend Endpoints (Missing)

### 5.1 Metrics Configuration
**Endpoint:** `GET /config/metrics`

**Controller:** `packages/backend/src/config/config.controller.ts`

**Response:**
```typescript
{
  metrics: Array<{
    id: string;
    label: string;
    unit: string;
    input_type: 'numeric' | 'scale' | 'select';
    options?: string[];
    min?: number;
    max?: number;
  }>;
}
```

---

### 5.2 Patient Vitals
**Endpoints:**
- `GET /patients/me/vitals` - Get latest vitals summary
- `POST /patients/me/vitals` - Record new vital reading

**Controller:** `packages/backend/src/patients/vitals.controller.ts`

---

### 5.3 Patient-Facing Lab/Referral/Document Endpoints
**Endpoints:**
- `GET /patients/me/lab-orders`
- `GET /patients/me/lab-results`
- `GET /patients/me/referrals`
- `GET /patients/me/documents`

**Controller:** `packages/backend/src/patients/patient-documents.controller.ts`

**Note:** These can be aliases to existing endpoints with patient ID from auth context.

---

## Phase 6: File Structure

Ensure the following structure exists:

```
packages/web/src/
├── app/
│   ├── patient/              # Frozen - only modify subcomponents
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── schedule/
│   │   ├── labs/
│   │   └── billing/
│   ├── clinician/            # Cursor builds ALL
│   │   ├── dashboard/
│   │   ├── patients/
│   │   │   └── [patientId]/
│   │   ├── careplans/
│   │   ├── labs/
│   │   ├── orders/
│   │   ├── referrals/
│   │   ├── documents/
│   │   ├── triage/
│   │   ├── visit-queue/
│   │   └── settings/
│   └── content/              # Ohimaa Content Engine
│       ├── programs/
│       │   └── [id]/
│       ├── meal-plans/
│       │   └── [id]/
│       ├── exercises/
│       │   └── [id]/
│       ├── resources/
│       ├── stress/
│       ├── sleep/
│       ├── hormone/
│       ├── gi-reset/
│       ├── detox/
│       └── support/
├── components/
│   ├── clinician/            # Clinician-specific components
│   ├── content/              # Content engine components
│   └── patient/              # Patient components (frozen)
├── hooks/
├── utils/
└── styles/
```

---

## Phase 7: Design & Styling

### 7.1 Design Rules
- Use same theme as Builder patient side (soft green/teal palette)
- Use modular components under `/components`
- Must be responsive for mobile web (WebView ready)
- Use TypeScript exclusively
- Use SWR or React Query for data fetching
- All clinician pages use consistent layout template (already exists in `/clinician/layout.tsx`)

### 7.2 Component Library
- Use shadcn/ui components (already installed)
- Extend with custom components as needed
- Ensure all components are mobile-responsive

---

## Phase 8: Testing & Validation

### 8.1 Acceptance Checklist
- ✅ All `/clinician/*` pages functional, styled, API-connected
- ✅ All `/content/*` pages ready for WebView embedding
- ✅ Patient web upgrades complete (BMI, labs, referrals, docs, metrics)
- ✅ Folder structure matches spec
- ✅ Patient routes untouched (only subcomponents modified)
- ✅ All content pages mobile-friendly
- ✅ API integration complete
- ✅ No TypeScript errors
- ✅ No build errors

---

## Implementation Order

1. **Complete Phase 1** (Schema & Backend) - Finish Prisma migration and missing endpoints
2. **Phase 2** (Clinician Portal) - Build all 10 clinician pages
3. **Phase 3** (Ohimaa Content) - Build all content pages
4. **Phase 4** (Patient Upgrades) - Update patient pages with new features
5. **Phase 5** (Missing Backend) - Create any missing backend endpoints
6. **Phase 6** (File Structure) - Ensure correct structure
7. **Phase 7** (Design) - Apply consistent styling
8. **Phase 8** (Testing) - Validate all features

---

## Notes

- **BMI is critical** for GLP-1 medication tracking - ensure it's prominently displayed and tracked
- **Measurement types are extensible** - use `/config/metrics` for dynamic configuration
- **All content pages must be mobile-friendly** - they're displayed in WebView inside mobile app
- **Patient routes are frozen** - only modify subcomponents, not route structure
- **Use existing clinician layout** - all clinician pages should use `/clinician/layout.tsx`

