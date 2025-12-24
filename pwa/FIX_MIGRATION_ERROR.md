# 🔧 Fix "relation already exists" Error

## ❌ Error You Got:
```
ERROR: 42P07: relation "medications" already exists
```

## ✅ Solution: Use Safe Migration

The `medications` table (or other tables) already exists. I've created a **safe version** that checks before creating.

### Use This Instead:

**File:** `supabase/migrations/003_missing_tables_safe.sql`

This version:
- ✅ Checks if tables exist before creating
- ✅ Skips existing tables
- ✅ Only creates what's missing
- ✅ Won't error if tables already exist

## 🚀 How to Fix:

1. **In Supabase SQL Editor:**
   - Click **New Query**
   - Open: `pwa/supabase/migrations/003_missing_tables_safe.sql`
   - Copy ALL contents
   - Paste and click **Run**

2. **It will:**
   - Skip tables that already exist
   - Create only missing tables
   - Show notices for each table

## 📋 What Tables Might Already Exist?

Check in Supabase Dashboard → Table Editor:
- ✅ `medications` - Already exists
- ❓ `medication_adherence` - Check
- ❓ `refill_requests` - Check
- ❓ `lab_orders` - Check
- ❓ `lab_tests` - Check
- ❓ `care_plans` - Check
- ❓ `encounters` - Check

## ✅ After Running Safe Migration

All missing tables will be created, and you won't get errors for existing ones!

