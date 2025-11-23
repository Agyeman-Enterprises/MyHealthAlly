# Architecture Connection Guide

## How Patient (Builder) and Clinician (React) Apps Connect

### 1. Authentication & Routing

**AuthContext** (`packages/web/src/contexts/AuthContext.tsx`):
- Handles login for both patient and clinician users
- Routes based on user role:
  - `PATIENT` → `/patient/dashboard` (Builder CMS)
  - `PROVIDER` / `MEDICAL_ASSISTANT` / `ADMIN` → `/clinician/dashboard` (React)

**Route Guards** (`packages/web/src/components/auth/RouteGuard.tsx`):
- Protects clinician routes: Only `PROVIDER`, `MEDICAL_ASSISTANT`, `ADMIN` can access `/clinician/*`
- Protects patient routes: Only `PATIENT` can access `/patient/*`
- Auto-redirects unauthorized users to appropriate dashboard

### 2. Patient App (Builder.io)

**Structure:**
- All routes under `/patient/*` and `/login`
- Next.js route files exist but only render `<BuilderPage>` wrapper
- Content is managed in Builder CMS (model: `patient-page`)
- Custom React components registered in Builder for health logic

**Example Route:**
```tsx
// packages/web/src/app/patient/dashboard/page.tsx
export default function PatientDashboardPage() {
  return (
    <BuilderPage
      model="patient-page"
      urlPath="/patient/dashboard"
      data={patientData}
    />
  );
}
```

**Builder Components:**
- Registered in `packages/web/src/components/builder/registry.ts`
- Components like `VitalsCard`, `HRVTrendCard` fetch data from backend APIs
- Builder controls layout/styling, React handles data/logic

### 3. Clinician App (React)

**Structure:**
- All routes under `/clinician/*`
- Pure React/Next.js pages (no Builder CMS)
- Protected by `RouteGuard` in layout
- Uses shadcn/ui + Tailwind for styling

**Layout:**
- `packages/web/src/app/clinician/layout.tsx`
- Wraps all clinician routes with `RouteGuard`
- Provides sidebar navigation and top bar

**Routes:**
- `/clinician/dashboard` - Overview
- `/clinician/patients` - Patient list
- `/clinician/patients/[patientId]` - Patient detail
- `/clinician/visit/[visitId]` - Virtual visit workspace
- `/clinician/tasks` - Task center
- `/clinician/messages` - Messaging
- `/clinician/labs` - Labs & results

### 4. Shared Infrastructure

**Root Layout** (`packages/web/src/app/layout.tsx`):
- Wraps entire app with `BuilderProvider` and `AuthProvider`
- Both patient and clinician routes share these providers

**Backend APIs:**
- Both apps use same backend (`packages/backend`)
- APIs are role-aware (JWT auth)
- Patient APIs: `/patients/me`, `/patients/analytics`
- Clinician APIs: `/patients`, `/visits`, `/tasks`, etc.

### 5. Navigation Flow

**Login Flow:**
1. User visits `/patient/login` (or `/login`)
2. AuthContext handles login
3. Based on role:
   - Patient → `/patient/dashboard` (Builder renders)
   - Clinician → `/clinician/dashboard` (React renders)

**Route Protection:**
- Clinician tries to access `/patient/*` → Redirected to `/clinician/dashboard`
- Patient tries to access `/clinician/*` → Redirected to `/patient/dashboard`
- Unauthenticated → Redirected to `/patient/login`

### 6. Data Flow

**Patient Side:**
1. Next.js route fetches data from backend APIs
2. Data passed to `<BuilderPage>` as `data` prop
3. Builder CMS renders layout with custom components
4. Custom components (e.g., `VitalsCard`) use `data` prop for display

**Clinician Side:**
1. React pages fetch data directly from backend APIs
2. Data displayed using React components
3. No Builder CMS involvement

### 7. Key Files

**Connection Points:**
- `packages/web/src/contexts/AuthContext.tsx` - Auth & routing
- `packages/web/src/components/auth/RouteGuard.tsx` - Route protection
- `packages/web/src/app/clinician/layout.tsx` - Clinician layout guard
- `packages/web/src/components/builder/BuilderPage.tsx` - Builder wrapper

**Patient Routes:**
- All in `packages/web/src/app/patient/*/page.tsx`
- All use `<BuilderPage>` wrapper

**Clinician Routes:**
- All in `packages/web/src/app/clinician/*/page.tsx`
- All are pure React components

### 8. Rules

✅ **DO:**
- Build clinician features in `/clinician/*` routes
- Use Builder CMS for patient content
- Keep route guards in place
- Use role-based routing in AuthContext

❌ **DON'T:**
- Modify patient routes (Builder owns them)
- Create React pages for patient features
- Remove route guards
- Mix Builder and React in same route

