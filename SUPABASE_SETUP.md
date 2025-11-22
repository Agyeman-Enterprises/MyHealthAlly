# Quick Supabase Setup Guide

## Why Supabase?

✅ **Easier setup** - No Docker needed  
✅ **Production-ready** - Same DB for dev and prod  
✅ **Team collaboration** - Shared database  
✅ **Free tier** - Generous limits  
✅ **Built-in features** - Auth, storage, real-time  

## 5-Minute Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: MyHealthAlly
   - **Database Password**: (generate a strong password, save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

### 2. Get Connection String

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string
5. It looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### 3. Update Backend .env

Edit `packages/backend/.env`:

```env
# Replace the DATABASE_URL with your Supabase connection string
# Add ?pgbouncer=true for connection pooling (recommended)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Important**: 
- Replace `[YOUR-PASSWORD]` with the password you set when creating the project
- Keep `?pgbouncer=true` for connection pooling (better performance)

### 4. Run Migrations

```bash
cd packages/backend
pnpm prisma generate
pnpm prisma migrate dev
```

### 5. Verify Connection

Check your Supabase dashboard → **Table Editor** - you should see all your tables!

## Connection String Formats

### For Application (Pooled - Recommended)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Port: **6543** (pooled)
- Add: `?pgbouncer=true`

### For Migrations (Direct)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```
- Port: **5432** (direct)
- Remove: `?pgbouncer=true`

**Tip**: Use direct connection (5432) for migrations, pooled (6543) for app runtime.

## Switching Between Docker and Supabase

You can easily switch by changing `DATABASE_URL` in `.env`:

**Docker (local)**:
```env
DATABASE_URL="postgresql://myhealthally:myhealthally_dev@localhost:5432/myhealthally?schema=public"
```

**Supabase (cloud)**:
```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 5 GB/month
- **API Requests**: Unlimited
- **Concurrent Connections**: 60

Perfect for development and small production deployments!

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Update `DATABASE_URL` in `.env`
3. ✅ Run migrations
4. ✅ Start developing!

For more details, see `docs/DATABASE_SETUP.md`

