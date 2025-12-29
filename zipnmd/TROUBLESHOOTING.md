# Troubleshooting - "Not Loading" Issues

## ✅ Quick Fixes

### 1. Missing Environment Variables

**Problem:** `.env.local` file is missing or incomplete

**Fix:**
1. Create `pwa/.env.local` file
2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Get credentials from: **Supabase Dashboard → Settings → API**
4. Restart dev server: `npm run dev`

### 2. Dev Server Not Running

**Problem:** Server crashed or didn't start

**Fix:**
```bash
cd pwa
npm run dev
```

Check for errors in the terminal output.

### 3. Supabase Not Migrated

**Problem:** Database tables don't exist

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Verify tables exist in Table Editor

### 4. Browser Console Errors

**Problem:** Check browser console (F12) for errors

**Common Errors:**
- `Invalid API key` → Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `relation does not exist` → Run migration
- `Row Level Security policy violation` → RLS is enabled, may need auth

### 5. Port Already in Use

**Problem:** Port 3000 is already in use

**Fix:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

## 🔍 Debug Steps

1. **Check dev server is running:**
   - Look for: `✓ Ready on http://localhost:3000`
   - If not, check terminal for errors

2. **Check environment variables:**
   ```bash
   cd pwa
   cat .env.local  # or type .env.local in PowerShell
   ```

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for red errors

4. **Check network tab:**
   - Press F12 → Network tab
   - Reload page
   - Check for failed requests (red)

5. **Verify Supabase connection:**
   - Check Supabase Dashboard → Table Editor
   - Tables should exist

## 📞 Still Not Working?

1. Share the exact error message from:
   - Terminal output
   - Browser console (F12)
   - Network tab errors

2. Verify:
   - ✅ `.env.local` exists with correct values
   - ✅ Migration has been run
   - ✅ Dev server is running
   - ✅ No port conflicts

