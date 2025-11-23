# MyHealthAlly - Automatic Startup

The unified startup script automatically handles everything for you. **No manual commands required!**

## Quick Start

Simply run:
```bash
pnpm dev
```

or

```bash
pnpm start
```

## What Happens Automatically

1. ✅ **Finds available ports** - Automatically detects if ports 3000/3001 are in use and finds alternatives
2. ✅ **Starts backend** - Launches NestJS backend with proper PORT environment variable
3. ✅ **Waits for backend health** - Confirms backend is healthy via `/health` endpoint
4. ✅ **Starts frontend** - Launches Next.js frontend on the assigned port
5. ✅ **Waits for frontend** - Confirms frontend is reachable
6. ✅ **Streams all logs** - All backend and frontend logs appear in your console
7. ✅ **Reports success** - Shows final URLs when both services are ready

## Example Output

```
🔍 Finding available ports...
✔ Backend port: 3000
✔ Frontend port: 3001

🚀 Starting backend...
⏳ Waiting for backend health check...
✔ Backend is UP at: http://localhost:3000

🚀 Starting frontend...
⏳ Waiting for frontend to respond...
✔ Frontend is UP at: http://localhost:3001

═══════════════════════════════════════════════════════════
    🎉 Servers Running Successfully!
═══════════════════════════════════════════════════════════

  Backend:  http://localhost:3000
  Frontend: http://localhost:3001

Both services are healthy and ready.

Press Ctrl+C to stop all servers
```

## Stopping Servers

Press `Ctrl+C` to gracefully stop both backend and frontend servers.

## Troubleshooting

- If ports are in use, the script automatically finds alternatives
- If a service fails to start, you'll see a clear error message
- All logs stream directly to your console for easy debugging
