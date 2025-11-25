# Style Revert Plan - Restoring Builder-Style Tailwind Classes

## Issue
I incorrectly converted Tailwind utility classes to CSS variables. Need to revert to Builder-style Tailwind classes.

## Required Pattern
- Backgrounds: `bg-gradient-to-br from-slate-50 to-teal-50` or `bg-white` or `bg-slate-50`
- Text: `text-slate-900`, `text-slate-600`, `text-slate-400`
- Borders: `border-slate-200`, `border-teal-200`
- Teal accents: `bg-teal-50`, `text-teal-600`, `border-teal-200`
- Primary actions: `bg-teal-600`, `text-white`

## Conversion Map
- `style={{ backgroundColor: 'var(--color-background)' }}` → `bg-gradient-to-br from-slate-50 to-teal-50`
- `style={{ backgroundColor: 'var(--color-surface)' }}` → `bg-white`
- `style={{ color: 'var(--color-textPrimary)' }}` → `text-slate-900`
- `style={{ color: 'var(--color-textSecondary)' }}` → `text-slate-600`
- `style={{ color: 'var(--color-primary)' }}` → `text-teal-600`
- `style={{ backgroundColor: 'var(--color-primaryLight)' }}` → `bg-teal-50`
- `style={{ borderColor: 'var(--color-border)' }}` → `border-slate-200`

## Files to Fix
All files I modified that now use CSS variables need to be reverted to Tailwind classes.

