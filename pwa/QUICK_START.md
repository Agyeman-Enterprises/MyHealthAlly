# Quick Start - MHA PWA with Supabase

## ✅ Step 1: Run Supabase Migration

**Option A: Via Supabase Dashboard (Recommended)**
1. Open https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Open `supabase/migrations/001_initial_schema.sql`
5. Copy ALL contents and paste into SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Wait for success message

**Option B: Verify Migration Worked**
- Go to **Table Editor** in Supabase Dashboard
- You should see: `users`, `patients`, `clinicians`, `vitals`, `message_threads`, `messages`, `tasks`, `alerts`

## ✅ Step 2: Environment Variables

Create `pwa/.env.local` (if not exists):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard → Settings → API**

## ✅ Step 3: Start Dev Server

```bash
cd pwa
npm run dev
```

Server will start at: http://localhost:3000

## ✅ Step 4: Test Provider Routes

1. Navigate to: http://localhost:3000/provider/dashboard
2. Routes should load (may show empty data if no records yet)
3. Check browser console for any errors

## 🔍 Troubleshooting

**Error: "Invalid API key"**
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

**Error: "relation does not exist"**
- Migration not run yet - go back to Step 1

**Error: "Row Level Security policy violation"**
- RLS is enabled - you may need to authenticate first
- For testing, you can temporarily disable RLS in Supabase Dashboard

## 📝 Next Steps

- Add test data via Supabase Dashboard → Table Editor
- Set up authentication (Supabase Auth)
- Implement sync to SoloPractice

