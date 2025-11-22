# Database Setup Guide: Docker vs Supabase

## Why Docker Was Initially Configured

The original spec requested Docker setup for local development because:

1. **Zero External Dependencies**: Works completely offline
2. **Consistent Environment**: Same setup for all developers
3. **Fast Iteration**: No network latency for local development
4. **Cost-Free**: No cloud service costs during development
5. **Full Control**: Complete database access and configuration

## Why Supabase is Often Better

### Advantages of Supabase:

1. **Managed Service**: No need to run Docker locally
2. **Built-in Features**:
   - Automatic backups
   - Connection pooling
   - Real-time subscriptions (if needed)
   - Built-in authentication (can complement our JWT)
   - Storage for file uploads
   - Edge functions

3. **Production-Ready**: Same database for dev and prod
4. **Free Tier**: Generous free tier for development
5. **Better for Teams**: Shared database, easier collaboration
6. **Prisma Compatible**: Works seamlessly with Prisma

### When to Use Each:

**Use Docker if:**
- You want offline development
- You need complete database control
- You're doing heavy local testing
- You want to avoid cloud dependencies

**Use Supabase if:**
- You want easier setup (no Docker needed)
- You need team collaboration
- You want production-like environment
- You want built-in features (auth, storage, real-time)
- You're deploying to production soon

## Recommended: Use Supabase

For most projects, **Supabase is the better choice** because:
- Easier onboarding for new developers
- Production-ready from day one
- Better for team collaboration
- Free tier is generous
- Built-in features save development time

## Setup Instructions

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create a new project
   - Wait for database to provision

2. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
   ```

4. **Run Migrations**:
   ```bash
   cd packages/backend
   pnpm prisma migrate dev
   ```

**Note**: Add `?pgbouncer=true` for connection pooling (recommended for Supabase)

### Option 2: Docker (Local Development)

1. **Start Docker**:
   ```bash
   docker-compose up -d
   ```

2. **Use Local Connection String**:
   ```env
   DATABASE_URL="postgresql://myhealthally:myhealthally_dev@localhost:5432/myhealthally?schema=public"
   ```

3. **Run Migrations**:
   ```bash
   cd packages/backend
   pnpm prisma migrate dev
   ```

## Hybrid Approach (Best of Both)

You can use **Supabase for production** and **Docker for local development**:

- **Development**: Use Docker (fast, offline)
- **Staging/Production**: Use Supabase (managed, reliable)

Just switch the `DATABASE_URL` in your `.env` file!

## Migration from Docker to Supabase

If you already have data in Docker:

1. Export data from Docker:
   ```bash
   docker exec myhealthally-postgres pg_dump -U myhealthally myhealthally > backup.sql
   ```

2. Import to Supabase:
   - Use Supabase SQL Editor
   - Or use `psql` with your Supabase connection string

## Connection Pooling

Supabase uses PgBouncer for connection pooling. Always add `?pgbouncer=true` to your connection string when using Supabase.

**Direct connection** (for migrations):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**Pooled connection** (for application):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
```

## Security Notes

- **Never commit** `.env` files with real credentials
- Use Supabase's **connection pooling** for production
- Rotate database passwords regularly
- Use **SSL connections** in production (Supabase enforces this)

