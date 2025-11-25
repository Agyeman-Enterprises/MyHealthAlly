# MyHealthAlly Navigation Architecture

**Prepared by:** Fusion (UI/UX)  
**For:** Cursor (React Implementation)  
**Status:** Production-Ready UI Package  

---

## Table of Contents
1. [Navigation Overview](#navigation-overview)
2. [Navigation Components](#navigation-components)
3. [Page Structure](#page-structure)
4. [Patient User Flow](#patient-user-flow)
5. [Clinician User Flow](#clinician-user-flow)
6. [Route Map](#route-map)
7. [Layout Wrappers](#layout-wrappers)
8. [Mobile Responsiveness](#mobile-responsiveness)
9. [Navigation Best Practices](#navigation-best-practices)

---

## Navigation Overview

The application has **two distinct user roles** with separate navigation systems:
- **Patient Role**: Health monitoring, messaging, appointments
- **Clinician Role**: Patient management, alerts, visit scheduling

### Key Principles
- Clear role separation at login
- Consistent sidebar navigation within each role
- Responsive design for mobile
- Easy navigation between related sections
- Return paths (back buttons) on all pages

---

## Navigation Components

### 1. PatientNav Component
**Location:** `client/components/PatientNav.tsx`

Provides header + sidebar navigation for patient pages.

```tsx
<PatientNav activePage="/dashboard" />
```

**Features:**
- Sticky top header with logo
- Mobile-responsive sidebar (hamburger menu)
- User profile section in sidebar
- Navigation items: Dashboard, Vitals, Care Plan, Messages, Appointments, Settings
- Active page highlighting
- Sign out button

**Nav Items:**
```
Dashboard      → /dashboard
Vitals Trends  → /vitals
Care Plan      → /care-plan
Messages       → /messages
Appointments   → /appointments
Settings       → /settings
```

### 2. ClinicianNav Component
**Location:** `client/components/ClinicianNav.tsx`

Provides header + sidebar navigation for clinician pages.

```tsx
<ClinicianNav activePage="/clinician/dashboard" />
```

**Features:**
- Same responsive design as PatientNav
- Clinician-specific nav items
- Active page highlighting
- Sign out button

**Nav Items:**
```
Dashboard      → /clinician/dashboard
Patients       → /clinician/patients
Alerts & Triage → /clinician/alerts
Visit Queue    → /clinician/visits
Messages       → /clinician/messages
Settings       → /clinician/settings
```

### 3. PatientLayout Wrapper
**Location:** `client/components/PatientLayout.tsx`

Wraps patient pages with navigation, header, and layout.

```tsx
export default function PatientDashboard() {
  return (
    <PatientLayout activePage="/dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page content */}
      </div>
    </PatientLayout>
  );
}
```

**Responsibilities:**
- Applies PatientNav component
- Sets page background gradient
- Manages layout structure
- Ensures consistent spacing

### 4. ClinicianLayout Wrapper
**Location:** `client/components/ClinicianLayout.tsx`

Wraps clinician pages with navigation, header, and layout.

```tsx
export default function ClinicianDashboard() {
  return (
    <ClinicianLayout activePage="/clinician/dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page content */}
      </div>
    </ClinicianLayout>
  );
}
```

---

## Page Structure

### Patient Pages (All should use PatientLayout)

1. **Dashboard** (`/dashboard`)
   - Overview of health status
   - Quick metrics tiles
   - Recent messages
   - Upcoming appointments
   - Quick action buttons

2. **Vitals Trends** (`/vitals`)
   - Chart visualization of vital signs
   - Date range selector
   - Export/share options
   - Target range indicators

3. **Care Plan** (`/care-plan`)
   - Active goals
   - Medications
   - Activity recommendations
   - Diet guidelines
   - Scheduled checkups

4. **Messages** (`/messages`)
   - Message thread list
   - Active conversation view
   - Message compose
   - Search functionality

5. **Appointments** (`/appointments`)
   - Upcoming appointments
   - Past visits
   - Book appointment button
   - Appointment details modal

6. **Settings** (`/settings`)
   - Profile information
   - Notification preferences
   - Password change
   - Privacy settings
   - Data export
   - Sign out

### Clinician Pages (All should use ClinicianLayout)

1. **Dashboard** (`/clinician/dashboard`)
   - KPI cards (patients, visits, alerts, tasks)
   - Alert list
   - Today's appointments
   - Patient summary
   - Quick actions

2. **Patients** (`/clinician/patients`)
   - Patient list/grid
   - Search and filter
   - Risk indicators
   - Quick actions per patient
   - Patient detail modal or link

3. **Alerts & Triage** (`/clinician/alerts`)
   - Alert queue by severity
   - Patient name and issue
   - Metrics details
   - Triage actions
   - Filter: All, Pending, Reviewed

4. **Visit Queue** (`/clinician/visits`)
   - Waiting room (current requests)
   - Today's schedule (appointments)
   - Priority indicators
   - Start visit button
   - Appointment details

5. **Messages** (`/clinician/messages`)
   - Patient conversation list
   - Active conversation view
   - Send message form
   - Attachment support

6. **Settings** (`/clinician/settings`)
   - Alert preferences
   - Message notifications
   - Password change
   - Privacy/compliance
   - Data export
   - Sign out

---

## Patient User Flow

```
┌─────────────────────────────────────────┐
│  Landing Page (Index)                   │
│  - Hero section                         │
│  - Features overview                    │
│  - CTAs: Sign In / Get Started          │
└──────────────────┬──────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  Login Page          │
        │  - Email field       │
        │  - Password field    │
        │  - Sign in button    │
        │  - Sign up link      │
        └──────────┬───────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  Role Selection      │
        │  - Patient card      │
        │  - Clinician card    │
        └──────────┬───────────┘
                   │
                   ├──→ PATIENT PATH
                   │
                   ↓
        ┌──────────────────────────────┐
        │  Patient Dashboard           │
        │  (Hub - use PatientLayout)   │
        │  - Metrics overview          │
        │  - Messages preview          │
        │  - Appointments preview      │
        │  - Sidebar nav active        │
        └──────────┬───────────────────┘
                   │
        ┌──────────┴──────────┬──────────┬──────────┐
        │                     │          │          │
        ↓                     ↓          ↓          ↓
    Vitals Trends        Care Plan   Messages   Appointments
    (use PatientLayout)  (...)       (...)      (...)
        │                 │          │          │
        └─────────────────┴──────────┴──────────┘
                          │
                          ↓
                    Settings Page
                    (Sign Out here)
```

---

## Clinician User Flow

```
┌─────────────────────────────────────────┐
│  Landing Page (Index)                   │
│  - Hero section                         │
│  - Features overview                    │
│  - CTAs: Sign In / Get Started          │
└──────────────────┬──────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  Login Page          │
        │  - Email field       │
        │  - Password field    │
        │  - Sign in button    │
        └──���───────┬───────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  Role Selection      │
        │  - Patient card      │
        │  - Clinician card    │
        └──────────┬───────────┘
                   │
                   └──→ CLINICIAN PATH
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Clinician Dashboard         │
        │  (Hub - use ClinicianLayout) │
        │  - KPI cards                 │
        │  - Alerts list               │
        │  - Today's schedule          │
        │  - Sidebar nav active        │
        └──────────┬───────────────────┘
                   │
        ┌──────────┼──────────┬──────────┬──────────┐
        │          │          │          │          │
        ↓          ↓          ↓          ↓          ↓
    Patients  Alerts &    Visit Queue Messages  Patient Detail
    (...)     Triage      (...)        (...)     (Modal/Page)
        │          │          │          │          │
        └──────────┴──────────┴──────────┴──────────┘
                          │
                          ↓
                    Settings Page
                    (Sign Out here)
```

---

## Route Map

### Public Routes
```
GET /                    → Index (Landing Page)
GET /login               → Login Page
GET /signup              → Signup Page
GET /role-selection      → Role Selection Page
```

### Patient Routes (Protected)
```
GET /dashboard           → Patient Dashboard
GET /vitals              → Vitals Trends
GET /care-plan           → Care Plan View
GET /messages            → Messages Inbox
GET /appointments        → Appointments List
GET /visit               → Virtual Visit
GET /settings            → Patient Settings
```

### Clinician Routes (Protected)
```
GET /clinician/dashboard → Clinician Dashboard
GET /clinician/patients  → Patient List
GET /clinician/patient/:id → Patient Detail
GET /clinician/alerts    → Alerts & Triage
GET /clinician/visits    → Visit Queue
GET /clinician/messages  → Messages
GET /clinician/virtual-visit/:id → Virtual Visit
GET /clinician/settings  → Clinician Settings
```

### Legacy Routes (Deprecate)
```
GET /staff               → StaffDashboard (OLD)
GET /alerts              → Alerts (OLD)
GET /care-plan-editor    → CarePlanEditor (OLD)
```

---

## Layout Wrappers

### Using PatientLayout
Every patient page should be wrapped with PatientLayout:

```tsx
import PatientLayout from "@/components/PatientLayout";

export default function MyPatientPage() {
  return (
    <PatientLayout activePage="/my-page-path">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your page content */}
      </div>
    </PatientLayout>
  );
}
```

**activePage prop values:**
- `/dashboard`
- `/vitals`
- `/care-plan`
- `/messages`
- `/appointments`
- `/settings`

### Using ClinicianLayout
Every clinician page should be wrapped with ClinicianLayout:

```tsx
import ClinicianLayout from "@/components/ClinicianLayout";

export default function MyClinicianPage() {
  return (
    <ClinicianLayout activePage="/clinician/my-page-path">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your page content */}
      </div>
    </ClinicianLayout>
  );
}
```

**activePage prop values:**
- `/clinician/dashboard`
- `/clinician/patients`
- `/clinician/alerts`
- `/clinician/visits`
- `/clinician/messages`
- `/clinician/settings`

---

## Mobile Responsiveness

### Sidebar Behavior
- **Desktop (md breakpoint and up):** Sidebar always visible on left
- **Mobile (below md breakpoint):** Sidebar hidden by default, toggled with hamburger menu
- **Overlay:** Mobile sidebar shows overlay to close when clicked

### Header
- **All sizes:** Sticky header with navigation
- **Logo text:** Hidden on mobile, visible on tablet+
- **Menu button:** Visible only on mobile (md breakpoint)

### Content Area
- **Padding:** 4-6px on mobile, 6-8px on desktop
- **Max-width:** Constrains to 7xl on larger screens
- **Responsive grid:** Grid layouts adapt columns for mobile

---

## Navigation Best Practices

### 1. Active Page Highlighting
Always pass the `activePage` prop to layout components:
```tsx
<PatientLayout activePage="/dashboard">
```

This highlights the current section in the sidebar.

### 2. Consistent Spacing
Use consistent padding and max-widths:
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
```

### 3. Back Buttons
On detail pages, always include a back button:
```tsx
<Link to="/previous-page" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
  <ChevronLeft className="w-5 h-5" />
  Back
</Link>
```

### 4. Modal Navigation
For modals/dialogs:
- Use `<Dialog>` component from shadcn/ui
- Don't change URL
- Include close button (X)
- Don't deep-link modals in URLs

### 5. External Links
Use standard `<a>` tags for external links, not `<Link>`:
```tsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

### 6. Loading States
Show loading indicators while fetching data:
```tsx
{isLoading ? (
  <Skeleton className="h-12 w-full rounded-lg" />
) : (
  <div>{content}</div>
)}
```

### 7. Error Handling
Provide clear error messages and recovery options:
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {error.message}
      <button onClick={retry}>Retry</button>
    </AlertDescription>
  </Alert>
)}
```

### 8. Empty States
Always handle empty data gracefully:
```tsx
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-lg font-medium text-slate-900">No items found</p>
    <p className="text-slate-600">Create one to get started</p>
  </div>
)}
```

---

## Implementation Checklist for Cursor

### Layout Components
- [ ] Verify PatientNav component usage on all patient pages
- [ ] Verify ClinicianNav component usage on all clinician pages
- [ ] Test mobile responsive behavior (hamburger menu, overlay)
- [ ] Test active page highlighting on navigation items
- [ ] Verify sidebar scrolls independently on long content

### Patient Pages
- [ ] Dashboard: Uses PatientLayout with activePage="/dashboard"
- [ ] Vitals: Uses PatientLayout with activePage="/vitals"
- [ ] Care Plan: Uses PatientLayout with activePage="/care-plan"
- [ ] Messages: Uses PatientLayout with activePage="/messages"
- [ ] Appointments: Uses PatientLayout with activePage="/appointments"
- [ ] Settings: Uses PatientLayout with activePage="/settings"

### Clinician Pages
- [ ] Dashboard: Uses ClinicianLayout with activePage="/clinician/dashboard"
- [ ] Patients: Uses ClinicianLayout with activePage="/clinician/patients"
- [ ] Alerts: Uses ClinicianLayout with activePage="/clinician/alerts"
- [ ] Visits: Uses ClinicianLayout with activePage="/clinician/visits"
- [ ] Messages: Uses ClinicianLayout with activePage="/clinician/messages"
- [ ] Settings: Uses ClinicianLayout with activePage="/clinician/settings"

### Routes
- [ ] All routes added to App.tsx
- [ ] Public routes accessible without auth
- [ ] Patient routes protected (requires role="patient")
- [ ] Clinician routes protected (requires role="clinician")
- [ ] Role selection page works correctly
- [ ] 404 fallback route works

### Functionality
- [ ] Navigation items navigate correctly
- [ ] Sign out clears auth state and redirects to login
- [ ] Back buttons return to appropriate pages
- [ ] Mobile menu closes when clicking a nav item
- [ ] Active page highlighting works correctly

---

## File Structure

```
client/
├── components/
│   ├── PatientNav.tsx          ← Patient header + sidebar
│   ├── ClinicianNav.tsx        ← Clinician header + sidebar
│   ├── PatientLayout.tsx       ← Patient page wrapper
│   ├── ClinicianLayout.tsx     ← Clinician page wrapper
│   └── ui/                     ← shadcn/ui components
│
├── pages/
│   ├── Index.tsx               ← Landing page
│   ├── Login.tsx               ← Login page
│   ├── Signup.tsx              ← Signup page
│   ├── RoleSelection.tsx       ← Role selection
│   ├── Dashboard.tsx           ← Patient dashboard
│   ├── VitalsTrends.tsx        ← Patient vitals
│   ├── CarePlan.tsx            ← Patient care plan
│   ├── Messages.tsx            ← Patient messages
│   ├── Appointments.tsx        ← Patient appointments
│   ├── VirtualVisit.tsx        ← Patient virtual visit
│   ├── PatientSettings.tsx     ← Patient settings
│   ├── NotFound.tsx            ← 404 page
│   │
│   └── clinician/
│       ├── ClinicianDashboard.tsx      ← Clinician dashboard
│       ├── ClinicianPatients.tsx       ← Clinician patients list
│       ├── ClinicianPatientDetail.tsx  ← Clinician patient detail
│       ├── ClinicianMessages.tsx       ← Clinician messages
│       ├── ClinicianAlertsTriage.tsx   ← Clinician alerts
│       ├── ClinicianVisitQueue.tsx     ← Clinician visits
│       ├── ClinicianSettings.tsx       ← Clinician settings
│       └── ClinicianVirtualVisit.tsx   ← Clinician virtual visit
│
└── App.tsx                     ← Routes configuration
```

---

## Questions or Issues?

- Check existing implementations in patient/clinician pages
- Refer to shadcn/ui documentation for UI components
- Use the color palette defined in `client/global.css`
- Follow spacing patterns from existing pages

---

**End of Navigation Documentation**
