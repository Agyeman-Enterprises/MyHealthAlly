# Quick Start Guide

## Choose Your Database Setup

### 🚀 Option 1: Supabase (Recommended)

**Why Supabase?**
- ✅ No Docker needed
- ✅ Production-ready from day one
- ✅ Free tier (500MB database, 5GB bandwidth)
- ✅ Built-in features (auth, storage, real-time)
- ✅ Easy team collaboration

**Setup (5 minutes):**

1. Create account at https://supabase.com
2. Create new project → Save your database password
3. Go to Settings → Database → Copy connection string
4. Update `packages/backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
5. Run migrations:
   ```bash
   cd packages/backend
   pnpm prisma migrate dev
   ```

**See `SUPABASE_SETUP.md` for detailed instructions.**

---

### 🐳 Option 2: Local Docker

**Why Docker?**
- ✅ Works completely offline
- ✅ Full database control
- ✅ No cloud dependencies
- ✅ Fast for local development

**Setup:**

1. Start Docker:
   ```bash
   docker-compose up -d
   ```

2. Use existing connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://myhealthally:myhealthally_dev@localhost:5432/myhealthally?schema=public"
   ```

3. Run migrations:
   ```bash
   cd packages/backend
   pnpm prisma migrate dev
   ```

---

## Recommendation

**For most projects, use Supabase** because:
- Easier onboarding
- Production-ready
- Better for teams
- Free tier is generous

**Use Docker if:**
- You need offline development
- You want complete control
- You're doing heavy local testing

You can switch between them anytime by just changing `DATABASE_URL`!

## Next Steps

After setting up your database:

1. Generate JWT secrets (see `ENV_SETUP.md`)
2. Start backend: `pnpm dev`
3. Start web: `cd packages/web && pnpm dev`

