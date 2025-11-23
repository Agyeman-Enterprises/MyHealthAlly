# Phase 1 - Clinician Class Replacement Guide

## Replacement Map

All clinician-specific classes must be replaced with theme CSS variables:

| Old Class | New Style |
|-----------|-----------|
| `bg-clinician-surface` | `style={{ backgroundColor: 'var(--color-surface)' }}` |
| `bg-clinician-panel` | `style={{ backgroundColor: 'var(--color-background)' }}` |
| `bg-clinician-bg` | `style={{ backgroundColor: 'var(--color-background)' }}` |
| `text-clinician-text` | `style={{ color: 'var(--color-textPrimary)' }}` + `text-body` class |
| `text-clinician-textMuted` | `style={{ color: 'var(--color-textSecondary)' }}` + `text-caption` class |
| `bg-clinician-primary` | `style={{ backgroundColor: 'var(--color-primary)' }}` |
| `bg-clinician-primary-soft` | `style={{ backgroundColor: 'var(--color-primaryLight)' }}` |
| `text-clinician-primary` | `style={{ color: 'var(--color-primary)' }}` |
| `bg-clinician-danger` | `style={{ backgroundColor: 'var(--color-danger)' }}` |
| `bg-clinician-warning` | `style={{ backgroundColor: 'var(--color-warning)' }}` |
| `bg-clinician-good` | `style={{ backgroundColor: 'var(--color-success)' }}` |
| `border-clinician-panel` | `style={{ borderColor: 'var(--color-border)' }}` |
| `divide-clinician-panel` | `className="divide-y"` + `style={{ borderColor: 'var(--color-border)' }}` |

## Typography Classes

Replace with theme typography:
- `text-2xl font-semibold` → `text-h2 font-semibold`
- `text-lg` → `text-h3`
- `text-sm` → `text-small` or `text-caption`
- `text-xs` → `text-caption`

## Status

- ✅ `packages/web/src/app/clinician/tasks/page.tsx` - COMPLETE
- ✅ `packages/web/src/app/clinician/messages/page.tsx` - COMPLETE
- ✅ `packages/web/src/app/clinician/labs/page.tsx` - COMPLETE
- ✅ `packages/web/src/app/clinician/patients/page.tsx` - COMPLETE
- ✅ `packages/web/src/components/auth/RouteGuard.tsx` - COMPLETE
- 🔄 `packages/web/src/app/clinician/patients/[patientId]/page.tsx` - IN PROGRESS
- 🔄 `packages/web/src/app/clinician/visit/[visitId]/page.tsx` - IN PROGRESS

