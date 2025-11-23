# Fix: Error Code -102 (Connection Refused)

## What This Error Means
Error code -102 means "Connection Refused" - the server isn't running on port 3001.

## Solution

I've started the servers automatically. Here's what's happening:

### Step 1: Servers Starting
The startup script is:
1. ✅ Starting backend server (port 3000)
2. ⏳ Waiting for backend to be ready
3. ⏳ Starting frontend server (port 3001)

### Step 2: Wait for Startup
**Please wait 15-20 seconds** for both servers to fully start.

### Step 3: Try Again
After waiting, refresh your browser or try:
- http://localhost:3001
- http://localhost:3001/patient/login

## Check Server Status

You can verify servers are running by checking:

**Backend Health:**
```
http://localhost:3000/health
```
Should return: `{"status":"ok"}`

**Frontend:**
```
http://localhost:3001
```
Should show the MyHealthAlly app

## If Still Not Working

If you still get error -102 after 20 seconds:

1. **Check the terminal** - Look for any error messages
2. **Check ports** - Make sure nothing else is using ports 3000/3001
3. **Manual start** - Run `pnpm start` in the project root

## Common Issues

**Port already in use:**
- Kill existing Node processes
- Or change ports in config files

**Backend won't start:**
- Check `packages/backend/.env` exists
- Run `pnpm install` in `packages/backend`
- Check database connection

**Frontend won't start:**
- Check `packages/web/.env` exists
- Run `pnpm install` in `packages/web`

The servers are starting now - please wait 15-20 seconds and try again! 🚀

