# Quick Fix: Internal Server Error

## Problem
Web dashboard (localhost:3001) shows Internal Server Error because backend API (localhost:3000) is not running.

## Solution

### Option 1: Start Backend Manually
```powershell
# From project root
cd packages\backend
pnpm dev
```

### Option 2: Use Start Script
```powershell
# From project root
.\start.ps1
```

### Option 3: Start Both Services
```powershell
# Terminal 1 - Backend
cd packages\backend
pnpm dev

# Terminal 2 - Web
cd packages\web
pnpm dev
```

## What I Fixed

1. ✅ Added error boundary (`packages/web/src/app/error.tsx`)
2. ✅ Enhanced error handling in `fetchAPI` function
3. ✅ Better error messages for connection failures
4. ✅ Started backend server

## Verification

Check if services are running:
- Backend: http://localhost:3000/health
- Web: http://localhost:3001

## Error Messages

If you see "Unable to connect to the server", it means:
- Backend API is not running on port 3000
- Start the backend: `cd packages\backend && pnpm dev`

The web dashboard will now show clear error messages instead of Internal Server Error.

