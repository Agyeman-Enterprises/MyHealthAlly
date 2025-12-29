# Environment Files Guide

## 📁 Environment Files

### `.env.local` (Development)
- **Location:** `pwa/.env.local`
- **Purpose:** Local development environment variables
- **Status:** ✅ Created (from root `.env`)
- **Git:** Ignored (not committed)
- **Contains:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_API_BASE_URL`

### `.env.production` (Production)
- **Location:** `pwa/.env.production`
- **Purpose:** Production environment variables (for `npm run build`)
- **Status:** ✅ Created (template)
- **Git:** Should be ignored (contains secrets)
- **Usage:** 
  - Set in Vercel/Railway/etc. dashboard (recommended)
  - Or use this file for local production builds

### `.env.production.example`
- **Location:** `pwa/.env.production.example`
- **Purpose:** Template for production env (safe to commit)
- **Status:** ✅ Created
- **Git:** Can be committed (no secrets)

## 🔧 Setup

### Development
```bash
# Already done - .env.local exists
# Contains your Supabase credentials from root .env
```

### Production (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if needed)
   - `NEXT_PUBLIC_API_BASE_URL`
3. Deploy

### Production (Other Platforms)
1. Copy `.env.production.example` to `.env.production`
2. Fill in your production values
3. Platform will use these during build

## 📝 Important Notes

- **Never commit `.env.local` or `.env.production`** (they contain secrets)
- **`.env.production.example` is safe to commit** (template only)
- **Vercel/Railway:** Set env vars in dashboard (recommended)
- **Local builds:** Use `.env.production` file

## ✅ Current Status

- ✅ `.env.local` - Created and configured
- ✅ `.env.production` - Created (template)
- ✅ `.env.production.example` - Created (template)
- ✅ `.gitignore` - Should ignore .env files

