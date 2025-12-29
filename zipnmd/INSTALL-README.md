# MHA Complete Fix - Installation Guide

## What's in this package:

```
MHA-COMPLETE-FIX.zip
├── components/layout/Header.tsx    ← REPLACES your existing Header.tsx
├── tailwind.config.ts              ← REPLACES your existing tailwind.config.ts
├── lib/utils/vital-validation.ts   ← NEW - clinical validation rules
├── app/vitals/page.tsx             ← REPLACES your existing vitals page
├── app/settings/notifications/page.tsx  ← NEW - fixes 404
└── app/settings/appearance/page.tsx     ← NEW - fixes 404
```

## Installation Steps:

### Step 1: Extract the zip
```powershell
cd C:\DEV\MyHealthAlly-1\pwa
Expand-Archive -Path ~\Downloads\MHA-COMPLETE-FIX.zip -DestinationPath . -Force
```

### Step 2: Restart the dev server
```powershell
# Stop the server (Ctrl+C) then:
npm run dev
```

### Step 3: Hard refresh browser
- Press Ctrl+Shift+R in your browser
- Or clear browser cache

## What This Fixes:

✅ **Navigation on ALL pages** - Header.tsx is the source, ALL pages use it
✅ **Breadcrumbs everywhere** - Home > Labs > etc. on every page
✅ **MHA colors** - Lavender (#B8A9C9), Navy (#3D4F6F), Sky (#7BA3C4)
✅ **Settings 404s** - notifications and appearance pages now exist
✅ **Vital validation** - BLOCKS dangerous values (BG <50, SpO2 <90, etc.)

## Clinical Thresholds (from your specifications):

| Vital | 🚨 BLOCKED - Go to ED |
|-------|----------------------|
| SpO2 | <90% |
| Blood Glucose | <50 or >350 mg/dL |
| Heart Rate | <55 or >150 bpm |
| Systolic BP | <90 or ≥180 mmHg |
| Diastolic BP | >105 mmHg |
| Temperature | >103.5°F or <93°F |

## Verify It's Working:

1. Go to http://localhost:3000/vitals
2. Enter Blood Glucose: 40
3. Should see FULL RED SCREEN that says "CALL 911 or go to ED"
4. Reading should NOT save

## If Colors Don't Change:

The tailwind config needs to be recompiled:
```powershell
# Delete the .next folder and restart
Remove-Item -Recurse -Force .next
npm run dev
```
