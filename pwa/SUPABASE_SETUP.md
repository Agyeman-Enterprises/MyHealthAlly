# Supabase Setup Guide for MHA

## ✅ What's Been Created

1. **Database Schema** - `pwa/supabase/migrations/001_initial_schema.sql`
   - All core tables (users, patients, clinicians, vitals, messages, tasks, alerts)
   - All enums (user roles, languages, vital types, etc.)
   - Indexes for performance
   - Row Level Security (RLS) policies
   - Triggers for `updated_at` timestamps

2. **TypeScript Types** - `pwa/lib/supabase/types.ts`
   - Full type definitions for all database tables
   - Enum types
   - Database interface for type-safe queries

3. **Query Utilities** - `pwa/lib/supabase/queries.ts`
   - `getPatients()` - List/search patients
   - `getPatient()` - Get single patient
   - `getMessageThreads()` - List message threads
   - `getMessages()` - Get messages in a thread
   - `getTasks()` - List tasks/work items
   - `updateTask()` - Update task status
   - `getPatientVitals()` - Get patient vitals
   - `getAlerts()` - Get alerts
   - `getDashboardStats()` - Dashboard statistics

4. **Provider Routes Updated**
   - ✅ `/provider/dashboard` - Uses Supabase
   - ✅ `/provider/patients` - Uses Supabase
   - ✅ `/provider/patients/[id]` - Uses Supabase
   - ✅ `/provider/messages` - Uses Supabase
   - ✅ `/provider/work-items` - Uses Supabase

## 🚀 Next Steps

### 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Create a new project
3. Note your project URL and anon key

### 2. Run Migration

1. In Supabase Dashboard → SQL Editor
2. Copy contents of `pwa/supabase/migrations/001_initial_schema.sql`
3. Paste and run

### 3. Configure Environment Variables

Create `pwa/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test the Routes

1. Start dev server: `npm run dev`
2. Navigate to `/provider/dashboard`
3. Routes should now use Supabase instead of mock API

## 📝 Notes

- **RLS Policies**: Basic policies are set up. You may need to refine them based on your auth requirements.
- **Missing Tables**: Some tables from files 01-07 are not yet created (medications, labs, care plans, etc.). Add them as needed.
- **Sync to SoloPractice**: The sync mechanism still needs to be implemented.

## 🔄 Data Flow

```
MHA PWA → Supabase (MHA database)
         ↓
    Sync Service
         ↓
   SoloPractice (SSOT)
```

