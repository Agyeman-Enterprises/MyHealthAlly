# Migration Files Location

## 📂 All Migration Files Are Here:

```
pwa/supabase/migrations/
├── 001_initial_schema.sql    (14 KB) - Core tables
├── 002_test_data.sql         (8 KB)  - Test data
└── 003_missing_tables.sql    (12 KB) - Medications, labs, care plans
```

## 🚀 Run Order:

1. **001_initial_schema.sql** - Run FIRST (creates core tables)
2. **003_missing_tables.sql** - Run SECOND (creates missing tables)
3. **002_test_data.sql** - Run THIRD (adds test data - optional)

## 📋 Quick Access:

**PowerShell:**
```powershell
cd pwa
notepad supabase\migrations\001_initial_schema.sql
notepad supabase\migrations\003_missing_tables.sql
notepad supabase\migrations\002_test_data.sql
```

**File Explorer:**
- Navigate to: `C:\DEV\MyHealthAlly-1\pwa\supabase\migrations\`

All files are ready to copy-paste into Supabase Dashboard! ✅

