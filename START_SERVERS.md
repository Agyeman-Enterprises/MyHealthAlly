# Starting MyHealthAlly Services

## Prerequisites Check

First, make sure you have:
- ✅ Node.js 22+ installed
- ✅ pnpm installed (or npm)
- ✅ Supabase connection configured in `.env`
- ✅ JWT secrets configured in `.env`

## Install pnpm (if not installed)

```powershell
npm install -g pnpm
```

Or use npm instead (update package.json scripts if needed).

## Step-by-Step Startup

### 1. Install Dependencies

```powershell
# From project root
pnpm install
```

### 2. Generate Prisma Client

```powershell
cd packages/backend
pnpm prisma generate
```

### 3. Run Database Migrations

```powershell
# Still in packages/backend
pnpm prisma migrate dev
```

This will:
- Create all database tables
- Seed default clinical rules
- Set up the schema

### 4. Start Backend Server

**Option A: From root (recommended)**
```powershell
# From project root
pnpm dev
```

**Option B: From backend directory**
```powershell
cd packages/backend
pnpm dev
```

Backend should start on: **http://localhost:3000**

### 5. Start Web Dashboard (in new terminal)

```powershell
cd packages/web
pnpm dev
```

Web dashboard should start on: **http://localhost:3001**

## Verify Everything Works

### Check Backend Health
Open browser: http://localhost:3000/health

Should return:
```json
{
  "status": "ok",
  "info": { "database": { "status": "up" } }
}
```

### Check Rules Engine
Open browser: http://localhost:3000/rules

Should return array of clinical rules (requires auth token).

### Check Web Dashboard
Open browser: http://localhost:3001

Should show login page.

## Troubleshooting

### "pnpm not found"
Install pnpm:
```powershell
npm install -g pnpm
```

### "Cannot connect to database"
- Check Supabase connection string in `packages/backend/.env`
- Verify Supabase project is active
- Check network connection

### "Port already in use"
- Backend (3000): Change `PORT` in `.env`
- Web (3001): Change port in `packages/web/package.json`

### Migration errors
```powershell
cd packages/backend
pnpm prisma migrate reset  # WARNING: Deletes all data
pnpm prisma migrate dev
```

## Quick Start Script

Create `start.ps1`:
```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/backend; pnpm dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start web
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/web; pnpm dev"
```

Run: `.\start.ps1`

## Services Running

Once started, you'll have:
- ✅ Backend API: http://localhost:3000
- ✅ Web Dashboard: http://localhost:3001
- ✅ Health checks working
- ✅ Rules engine active
- ✅ Database connected

Ready to develop! 🚀

