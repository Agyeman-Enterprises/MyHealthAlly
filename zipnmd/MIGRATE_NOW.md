# 🚀 MIGRATE NOW - Quick Steps

## ⚡ Fast Migration (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: **https://app.supabase.com**
2. Select your project

### Step 2: Run Migration
1. Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open this file: `pwa/supabase/migrations/001_initial_schema.sql`
4. **Select ALL** (Ctrl+A) and **Copy** (Ctrl+C)
5. **Paste** into SQL Editor
6. Click **Run** button (or press **Ctrl+Enter**)
7. Wait for: ✅ **"Success. No rows returned"**

### Step 3: Verify
1. Click **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `users`
   - ✅ `patients`
   - ✅ `clinicians`
   - ✅ `vitals`
   - ✅ `message_threads`
   - ✅ `messages`
   - ✅ `tasks`
   - ✅ `alerts`

## ✅ Done!

Your dev server should be running at: **http://localhost:3000**

Test routes:
- http://localhost:3000/provider/dashboard
- http://localhost:3000/provider/patients

---

## 🔧 Alternative: PowerShell Helper

Run this in PowerShell:
```powershell
cd pwa
.\scripts\migrate.ps1
```

This will open the migration file for you to copy.

