# 🚀 Auto-Run Migrations Setup

## Why Auto-Migration?

I was manually asking you to run migrations because:
- Supabase REST API doesn't support raw SQL execution
- Supabase CLI requires special installation (not via npm)
- Direct PostgreSQL connection is the most reliable method

## ✅ Solution: Direct PostgreSQL Connection

I've set up automatic migrations using the `pg` library to connect directly to your Supabase PostgreSQL database.

## 📋 Setup Steps:

### 1. Get Your Database Connection String

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Database**
3. Scroll to **Connection string**
4. Select **Connection pooling** → **Transaction** mode
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### 2. Add to `.env.local`

Add this line to `pwa/.env.local`:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:** 
- Replace `[password]` with your actual database password
- You can find the password in: **Settings** → **Database** → **Database password**
- Or reset it if needed

### 3. Run Auto-Migration

```bash
cd pwa
npm run migrate
```

This will:
- ✅ Connect to your Supabase database
- ✅ Run all 3 migrations in order
- ✅ Use safe versions (won't error if tables/data exist)
- ✅ Show progress for each migration

## 🎯 Migration Files (Auto-Run):

1. `001_initial_schema.sql` - Core tables
2. `003_missing_tables_safe.sql` - Medications, labs, care plans (safe)
3. `002_test_data_safe.sql` - Test data (safe)

## ✅ After Running:

All tables and test data will be created automatically!

## 🔧 Troubleshooting:

### Error: "pg library not installed"
```bash
cd pwa
npm install --save-dev pg dotenv
```

### Error: "Connection failed"
- Check your `DATABASE_URL` in `.env.local`
- Make sure password is correct
- Try using **Direct connection** instead of **Connection pooling** if pooling doesn't work

### Error: "relation already exists"
- This is OK! The safe migrations handle this
- The script will continue even if some tables exist

## 🚀 Quick Start:

1. Add `DATABASE_URL` to `pwa/.env.local`
2. Run: `npm run migrate`
3. Done! ✅

