# Fix: Internal Server Error on localhost:3001

## Issue
The web dashboard (localhost:3001) was showing an Internal Server Error because the backend API (localhost:3000) was not running.

## Root Cause
- Web app tries to connect to backend API at `http://localhost:3000`
- Backend API was not running
- API calls failed, causing server-side errors

## Solution Applied

### 1. Added Error Boundary
- Created `packages/web/src/app/error.tsx` to catch and display errors gracefully

### 2. Enhanced Error Handling
- Updated `fetchAPI` function in `packages/web/src/lib/utils.ts` to:
  - Catch network errors (connection failures)
  - Provide clear error messages
  - Handle API response errors better

### 3. Started Backend API
- Backend server started on port 3000
- Web app can now connect to the API

## How to Start Services

### Start Backend API:
```powershell
cd packages\backend
pnpm dev
```

### Start Web Dashboard:
```powershell
cd packages\web
pnpm dev
```

### Or use the start script:
```powershell
.\start.ps1
```

## Verification
- ✅ Backend API: http://localhost:3000
- ✅ Web Dashboard: http://localhost:3001
- ✅ Error handling improved
- ✅ Clear error messages for connection issues

## Next Steps
1. Ensure backend is running before accessing the web dashboard
2. Check browser console for specific error messages
3. Verify API endpoints are accessible: `curl http://localhost:3000/health`

