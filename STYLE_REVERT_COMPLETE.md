# Style Revert - Complete Documentation

## Status: IN PROGRESS

I am systematically reverting ALL CSS variables to Tailwind utility classes across all 42 files.

## Conversion Map

| CSS Variable | Tailwind Class |
|-------------|----------------|
| `var(--color-background)` | `bg-gradient-to-br from-slate-50 to-teal-50` |
| `var(--color-surface)` | `bg-white` |
| `var(--color-textPrimary)` | `text-slate-900` |
| `var(--color-textSecondary)` | `text-slate-600` |
| `var(--color-primary)` | `text-teal-600` |
| `var(--color-primaryLight)` | `bg-teal-50` |
| `var(--color-border)` | `border-slate-200` |
| `var(--color-success)` | `bg-emerald-500` or `text-emerald-600` |
| `var(--color-warning)` | `bg-amber-500` or `text-amber-600` |
| `var(--color-danger)` | `bg-red-500` or `text-red-600` |

## Files Completed ✅

1. ✅ `packages/web/src/app/marketing/page.tsx`
2. ✅ `packages/web/src/app/marketing/features/page.tsx`
3. ✅ `packages/web/src/app/marketing/privacy/page.tsx`
4. ✅ `packages/web/src/app/marketing/terms/page.tsx`
5. ✅ `packages/web/src/app/marketing/clinicians/page.tsx`
6. ✅ `packages/web/src/app/patient/login/page.tsx`
7. ✅ `packages/web/src/app/patient/messages/page.tsx` (partial)
8. ✅ `packages/web/src/app/patient/voice-messages/page.tsx`
9. ✅ `packages/web/src/app/patient/voice-messages/[voiceMessageId]/page.tsx`
10. ✅ `packages/web/src/app/clinics/dashboard/page.tsx`
11. ✅ `packages/web/src/app/clinics/rules/page.tsx`
12. ✅ `packages/web/src/app/clinics/visits/page.tsx`
13. ✅ `packages/web/src/app/clinics/patients/page.tsx`
14. ✅ `packages/web/src/app/clinics/alerts/page.tsx`
15. ✅ `packages/web/src/app/clinician/chart/[patientId]/ChartTriageHistory.tsx`

## Files Remaining (30 files, ~478 matches)

- `packages/web/src/app/clinician/layout.tsx` (13 matches)
- `packages/web/src/app/clinician/dashboard/page.tsx` (14 matches)
- `packages/web/src/app/patient/dashboard/page.tsx` (9 matches)
- `packages/web/src/app/app/home/page.tsx` (27 matches)
- `packages/web/src/app/clinician/chart/[patientId]/page.tsx` (2 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartSidebar.tsx` (1 match)
- `packages/web/src/app/clinician/chart/[patientId]/ChartSummary.tsx` (16 matches)
- `packages/web/src/app/clinician/ScribeMD/ScribeNoteComposer.tsx` (9 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartReferralsPanel.tsx` (8 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartTimeline.tsx` (7 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartHeader.tsx` (6 matches)
- `packages/web/src/app/clinician/visit/[visitId]/page.tsx` (34 matches)
- `packages/web/src/app/clinician/labs/page.tsx` (22 matches)
- `packages/web/src/app/clinician/tasks/page.tsx` (17 matches)
- `packages/web/src/app/clinician/messages/page.tsx` (18 matches)
- `packages/web/src/app/clinician/triage/page.tsx` (32 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartDocumentsPanel.tsx` (8 matches)
- `packages/web/src/app/patient/profile/LanguagePreference.tsx` (17 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartLabsPanel.tsx` (7 matches)
- `packages/web/src/app/patient/profile/page.tsx` (16 matches)
- `packages/web/src/app/clinician/chart/[patientId]/ChartNotes.tsx` (14 matches)
- `packages/web/src/app/clinician/patients/[patientId]/page.tsx` (48 matches)
- `packages/web/src/app/clinician/patients/page.tsx` (13 matches)
- `packages/web/src/app/patient/analytics/page.tsx` (14 matches)
- `packages/web/src/app/content/support/page.tsx` (7 matches)
- `packages/web/src/app/content/programs/page.tsx` (4 matches)
- `packages/web/src/app/patient/labs/page.tsx` (10 matches)
- `packages/web/src/app/patient/schedule/page.tsx` (4 matches)
- `packages/web/src/app/patient/messages/page.tsx` (remaining matches)

## Rules Going Forward

🚫 **NEVER AGAIN:**
- Do NOT use CSS variables like `var(--color-*)`
- Do NOT use shadcn theme tokens like `bg-background`, `text-foreground`
- Do NOT replace Tailwind utility classes

✅ **ALWAYS:**
- Use Tailwind utility classes: `bg-slate-*`, `text-slate-*`, `bg-teal-*`, `text-teal-*`
- Preserve Builder gradient: `bg-gradient-to-br from-slate-50 to-teal-50`
- Keep existing Tailwind classes exactly as written

