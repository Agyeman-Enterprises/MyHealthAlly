# Migration Order - Run These in Sequence

## ⚠️ IMPORTANT: Run migrations in this exact order!

### 1. Initial Schema (REQUIRED FIRST)
**File:** `supabase/migrations/001_initial_schema.sql`

**What it does:**
- Creates all enums
- Creates core tables (users, patients, clinicians, vitals, messages, tasks, alerts)
- Sets up RLS policies
- Creates triggers

**Status:** ✅ Ready

---

### 2. Missing Tables (REQUIRED SECOND)
**File:** `supabase/migrations/003_missing_tables.sql`

**What it does:**
- Creates medications tables
- Creates labs tables
- Creates care plans tables
- Creates encounters table
- Sets up RLS policies
- Creates triggers

**Status:** ✅ Ready

**Note:** Run this BEFORE test data, as test data may reference these tables.

---

### 3. Test Data (OPTIONAL - For Testing)
**File:** `supabase/migrations/002_test_data.sql`

**What it does:**
- Creates 3 test users (1 clinician, 2 patients)
- Creates 1 test clinician
- Creates 2 test patients
- Creates sample vitals, messages, tasks, alerts

**Status:** ✅ Ready

**Note:** This is optional - only run if you want test data to play with.

---

## 🚀 Quick Migration Steps

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com → Your Project

2. **Run Migration 1:**
   - SQL Editor → New Query
   - Copy `001_initial_schema.sql`
   - Paste → Run
   - Wait for ✅ Success

3. **Run Migration 2:**
   - Still in SQL Editor → New Query
   - Copy `003_missing_tables.sql`
   - Paste → Run
   - Wait for ✅ Success

4. **Run Migration 3 (Optional):**
   - Still in SQL Editor → New Query
   - Copy `002_test_data.sql`
   - Paste → Run
   - Wait for ✅ Success

5. **Verify:**
   - Table Editor → Check tables exist
   - If you ran test data, check for records

---

## ✅ After Migrations

- ✅ All tables created
- ✅ All enums created
- ✅ RLS policies active
- ✅ Triggers working
- ✅ Test data loaded (if you ran migration 3)

**You're ready to test!** 🎉

