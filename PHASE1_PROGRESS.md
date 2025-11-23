# Phase 1 - UI Polish Pass Progress

## ✅ Completed

### Yellow/Debug Colors Removed
- ✅ Fixed `bg-yellow-500` in clinician layout → Now uses theme warning color
- ✅ Fixed `bg-yellow-50`, `border-yellow-200`, `text-yellow-600`, `text-yellow-800` in PatientUpcomingVisitCard → Now uses theme warning color
- ✅ Fixed `text-yellow-600` in VitalsCard components → Now uses theme warning color

### Components Updated
- ✅ `packages/web/src/app/clinician/layout.tsx` - Removed yellow status colors
- ✅ `packages/web/src/components/patient/PatientUpcomingVisitCard.tsx` - Fixed warning alert styling
- ✅ `packages/web/src/components/patient/VitalsCard.tsx` - Replaced yellow with theme warning
- ✅ `packages/web/src/components/patient/PatientVitalsCard.tsx` - Replaced yellow with theme warning
- ✅ `packages/web/src/components/ui/sheet.tsx` - Added theme styling for drawer panels
- ✅ `packages/web/src/app/clinician/tasks/page.tsx` - Replaced clinician classes with theme variables

## 🔄 In Progress

### Replacing Clinician-Specific Classes
Need to replace all `bg-clinician-*`, `text-clinician-*`, `border-clinician-*` classes with theme variables in:
- [ ] `packages/web/src/app/clinician/dashboard/page.tsx`
- [ ] `packages/web/src/app/clinician/patients/page.tsx`
- [ ] `packages/web/src/app/clinician/patients/[patientId]/page.tsx`
- [ ] `packages/web/src/app/clinician/visit/[visitId]/page.tsx`
- [ ] `packages/web/src/app/clinician/messages/page.tsx`
- [ ] `packages/web/src/app/clinician/labs/page.tsx`
- [ ] `packages/web/src/components/auth/RouteGuard.tsx`

## 📋 Remaining Tasks

1. Replace all clinician-specific Tailwind classes with theme CSS variables
2. Ensure all drawers/modals use theme styling
3. Verify all typography uses shared scale (h1/h2/h3/body/small/caption)
4. Apply teal theme consistently (gradients, buttons, CTAs)
5. Remove any remaining placeholder CSS

## 🎨 Theme Mapping

- `bg-clinician-surface` → `var(--color-surface)`
- `bg-clinician-panel` → `var(--color-background)`
- `bg-clinician-bg` → `var(--color-background)`
- `text-clinician-text` → `var(--color-textPrimary)`
- `text-clinician-textMuted` → `var(--color-textSecondary)`
- `bg-clinician-primary` → `var(--color-primary)`
- `bg-clinician-primary-soft` → `var(--color-primaryLight)`
- `bg-clinician-danger` → `var(--color-danger)`
- `bg-clinician-warning` → `var(--color-warning)`
- `bg-clinician-good` → `var(--color-success)`
- `border-clinician-panel` → `var(--color-border)`

