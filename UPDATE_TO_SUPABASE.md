# Update to Supabase Connection

## Quick Steps

1. **Get your Supabase connection string:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Go to: **Settings** → **Database**
   - Scroll to **Connection string** section
   - Select **URI** tab
   - Copy the connection string

2. **Update `packages/backend/.env`:**
   - Open `packages/backend/.env`
   - Replace the `DATABASE_URL` line with your Supabase connection string
   - **Important**: Add `?pgbouncer=true` at the end for connection pooling

3. **Example format:**
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

4. **Run migrations:**
   ```bash
   cd packages/backend
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

## Connection String Notes

- **Port 6543** = Pooled connection (use for application)
- **Port 5432** = Direct connection (use for migrations)
- **Add `?pgbouncer=true`** for pooled connections (recommended)

## After Updating

You can stop Docker if you're not using it:
```bash
docker-compose down
```

Your backend will now connect to Supabase instead of local Docker!

