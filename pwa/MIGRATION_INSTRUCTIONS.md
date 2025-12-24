# Supabase Migration Instructions

## Quick Migration (Recommended)

### Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

### Option 2: Supabase CLI (If installed)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

## Verify Migration

After running the migration, verify tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `users`
   - `patients`
   - `clinicians`
   - `vitals`
   - `message_threads`
   - `messages`
   - `tasks`
   - `alerts`

## Environment Variables

Make sure `pwa/.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard → Settings → API**

