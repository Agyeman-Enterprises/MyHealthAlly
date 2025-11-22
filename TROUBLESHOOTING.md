# Troubleshooting Guide

## Current Status

**Services Running:**
- Web Dashboard: Port 3001 (LISTENING)
- Prisma Studio: Port 5555 (LISTENING)
- Backend: Port 3000 (NOT RUNNING)

**Issue:** Browser not loading, can't see files

## Quick Fixes

### 1. Restart Web Server

```powershell
# Kill existing process
Get-Process -Id 198324 | Stop-Process -Force

# Restart web server
cd packages\web
pnpm dev
```

### 2. Check Browser Console

Open browser DevTools (F12) and check:
- Console for errors
- Network tab for failed requests
- Check if http://localhost:3001 is accessible

### 3. Verify Files Exist

All files are present:
- ✅ `packages/web/src/app/page.tsx` - Home page (redirects to /dashboard)
- ✅ `packages/web/src/app/login/page.tsx` - Login page
- ✅ `packages/web/src/app/dashboard/page.tsx` - Dashboard
- ✅ All components in `packages/web/src/components/`

### 4. Try Direct URLs

- http://localhost:3001/login
- http://localhost:3001/dashboard
- http://localhost:5555 (Prisma Studio)

### 5. Check Next.js Build

```powershell
cd packages\web
pnpm run build
```

If build fails, fix errors first.

### 6. Clear Next.js Cache

```powershell
cd packages\web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm dev
```

## File Locations

**Web Dashboard Files:**
- Main app: `packages/web/src/app/`
- Components: `packages/web/src/components/`
- Styles: `packages/web/src/app/globals.css`

**Backend Files:**
- API: `packages/backend/src/`
- Database: `packages/backend/prisma/schema.prisma`

**iOS Files:**
- App: `packages/ios/MyHealthAlly/`

**Android Files:**
- App: `packages/android/app/src/main/`

## Access Points

- Web Dashboard: http://localhost:3001
- Prisma Studio: http://localhost:5555
- Backend API: http://localhost:3000 (when running)

