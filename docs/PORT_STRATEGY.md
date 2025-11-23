# Port Strategy & Health Check Implementation

This document explains how the MyHealthAlly application handles port allocation, health checks, and service discovery.

---

## Overview

The application uses a unified startup script (`start-servers.js`) that:
1. Finds available ports for backend and frontend
2. Starts the backend server
3. Waits for backend health check
4. Starts the frontend server
5. Waits for frontend to be reachable
6. Reports success with final URLs

---

## Port Finding Implementation

### File: `port-finder.js`

Located at the root of the repository, this utility module provides port discovery functionality.

**Functions:**

#### `checkPort(port)`
Checks if a specific port is available.

```javascript
async function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}
```

**How it works:**
1. Creates a TCP server
2. Attempts to listen on the specified port
3. If successful, closes the server and returns `true`
4. If port is in use, returns `false`

#### `findAvailablePort(startPort, maxAttempts = 100)`
Finds the next available port starting from `startPort`.

```javascript
async function findAvailablePort(startPort, maxAttempts = 100) {
  // First check if the requested port is available
  const requestedAvailable = await checkPort(startPort);
  if (requestedAvailable) {
    return startPort;
  }
  
  // If not, find the next available port
  for (let port = startPort + 1; port < startPort + maxAttempts; port++) {
    const available = await checkPort(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${startPort}-${startPort + maxAttempts - 1}`);
}
```

**Behavior:**
1. First checks if `startPort` is available (returns it if yes)
2. If not, iterates through ports `startPort + 1` to `startPort + maxAttempts - 1`
3. Returns first available port
4. Throws error if no ports available in range

---

## Unified Startup Script

### File: `start-servers.js`

Located at the root of the repository, this script orchestrates the startup of both backend and frontend servers.

**Key Features:**
- Finds available ports dynamically
- Ensures backend and frontend use different ports
- Performs health checks before proceeding
- Provides clear status messages
- Handles graceful shutdown

### Port Allocation Logic

```javascript
const backendPort = await findAvailablePort(3000);
// Ensure frontend port is different from backend port
let frontendPort = await findAvailablePort(3001);
if (frontendPort === backendPort) {
  frontendPort = await findAvailablePort(backendPort + 1);
}

// Double-check they're different
if (frontendPort === backendPort) {
  console.error('❌ Error: Frontend and backend ports cannot be the same!');
  process.exit(1);
}
```

**Process:**
1. Finds available port starting from 3000 for backend
2. Finds available port starting from 3001 for frontend
3. If frontend port equals backend port, finds next available after backend port
4. Validates ports are different before proceeding

### Backend Startup

```javascript
backendProc = await startProcess(
  "pnpm",
  ["dev"],
  BACKEND_DIR,
  "backend",
  { PORT: backendPort.toString() }
);
```

**Details:**
- Runs `pnpm dev` in `packages/backend/` directory
- Sets `PORT` environment variable to the found port
- Backend reads `PORT` from environment (see `packages/backend/src/main.ts`)

### Backend Health Check

```javascript
const backendURL = `http://localhost:${backendPort}${BACKEND_HEALTH}`;
const backendUp = await waitForURL(backendURL, "backend");
```

**Health Check Endpoint:** `GET /health`

**Implementation:**
- Located in `packages/backend/src/health/health.controller.ts`
- Returns `{ status: "ok", timestamp: "..." }`
- No authentication required
- Used to verify backend is ready before starting frontend

**Wait Logic:**
```javascript
async function waitForURL(url, name) {
  for (let i = 0; i < RETRIES; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 2000 }, (res) => {
          resolve(res);
        });
        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy();
          reject(new Error("timeout"));
        });
      });
      if (res.statusCode === 200) return true;
    } catch (_) {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, INTERVAL));
  }
  return false;
}
```

**Parameters:**
- `RETRIES`: 40 attempts
- `INTERVAL`: 500ms between attempts
- **Total wait time**: ~20 seconds maximum

### Frontend Startup

```javascript
frontendProc = await startProcess(
  "pnpm",
  ["dev", "-p", frontendPort.toString()],
  FRONTEND_DIR,
  "frontend"
);
```

**Details:**
- Runs `pnpm dev -p <port>` in `packages/web/` directory
- Uses Next.js `-p` flag to specify port
- Frontend does not need to know backend port (uses `NEXT_PUBLIC_API_URL` or defaults)

### Frontend Health Check

```javascript
const frontendURL = `http://localhost:${frontendPort}/`;
const frontendUp = await waitForURL(frontendURL, "frontend");
```

**Implementation:**
- Checks if frontend root path (`/`) responds with 200 status
- Same retry logic as backend health check

---

## Backend Port Configuration

### File: `packages/backend/src/main.ts`

```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
console.log(`🚀 Backend running on http://localhost:${port}`);
```

**Behavior:**
1. Reads `PORT` from environment variable
2. Falls back to 3000 if not set
3. Startup script sets `PORT` dynamically

---

## Frontend Port Configuration

### File: `packages/web/package.json`

```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

**Behavior:**
1. Next.js defaults to port 3000
2. Startup script overrides with `-p` flag: `next dev -p 3001`
3. Can also be set via `PORT` environment variable (Next.js 13+)

---

## Health Check Endpoints

### Backend: `GET /health`

**Location:** `packages/backend/src/health/health.controller.ts`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Purpose:**
- Verify backend is running and ready
- Used by startup script before starting frontend
- Can be used by monitoring/load balancers

**Authentication:** Not required

---

## Mobile App Port Strategy

**Important:** Mobile apps do NOT use port-finding logic.

### Configuration

Mobile apps use environment variables to specify the backend URL:

**Development:**
```bash
# packages/mobile/.env.development
API_BASE_URL=http://localhost:3000
```

**Production:**
```bash
# packages/mobile/.env.production
API_BASE_URL=https://api.yourdomain.com
```

### Why No Port Finding?

1. **Simplicity**: Mobile apps connect to a known backend URL
2. **Network**: Mobile devices may be on different networks than development machine
3. **Production**: Production uses fixed domain names, not ports
4. **Discovery**: Port finding is only needed for local development with dynamic ports

### For Physical Device Testing

When testing on a physical iOS/Android device:

1. **Find your computer's local IP:**
   - macOS/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
   - Example: `192.168.1.100`

2. **Update mobile `.env.development`:**
   ```bash
   API_BASE_URL=http://192.168.1.100:3000
   ```

3. **Ensure backend is accessible:**
   - Backend must be running on your computer
   - Firewall must allow connections on port 3000
   - Backend CORS must allow your device's origin

---

## Port Conflict Resolution

### Scenario 1: Port 3000 in use

**Backend:**
- Startup script finds next available port (e.g., 3002)
- Backend starts on port 3002
- Health check uses port 3002

**Frontend:**
- Startup script finds next available port after backend (e.g., 3003)
- Frontend starts on port 3003

### Scenario 2: Both default ports in use

**Backend:**
- Finds first available port starting from 3000 (e.g., 3005)

**Frontend:**
- Finds first available port starting from 3001
- If that equals backend port, finds next available (e.g., 3006)

### Error Handling

If no ports available in range:
```
❌ Error: No available ports found in range 3000-3099
```

Startup script exits with code 1.

---

## Code Files Reference

### Port Finding
- **File**: `port-finder.js` (root)
- **Exports**: `findAvailablePort`, `findAvailablePorts`, `checkPort`

### Startup Script
- **File**: `start-servers.js` (root)
- **Purpose**: Orchestrates backend and frontend startup
- **Dependencies**: `port-finder.js`

### Backend Configuration
- **File**: `packages/backend/src/main.ts`
- **Port Source**: `process.env.PORT` or default 3000

### Backend Health Check
- **File**: `packages/backend/src/health/health.controller.ts`
- **Endpoint**: `GET /health`
- **Response**: `{ status: "ok", timestamp: string }`

### Frontend Configuration
- **File**: `packages/web/package.json`
- **Port Source**: `-p` flag or `PORT` env var

---

## Usage

### Starting Servers

```bash
# From repository root
node start-servers.js
```

**Output:**
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

### Stopping Servers

Press `Ctrl+C` to gracefully shutdown both servers.

---

## Troubleshooting

### Backend Health Check Fails

**Possible causes:**
1. Backend failed to start (check backend logs)
2. Backend is listening on different port
3. Backend health endpoint not responding

**Solution:**
- Check backend console output for errors
- Verify backend is actually running
- Check if port is actually in use

### Frontend Health Check Fails

**Possible causes:**
1. Frontend failed to start (check frontend logs)
2. Frontend is listening on different port
3. Next.js build errors

**Solution:**
- Check frontend console output for errors
- Verify Next.js build completed successfully
- Check for TypeScript/compilation errors

### Port Conflicts

**Solution:**
- Stop other services using ports 3000-3099
- Or modify `start-servers.js` to use different base ports
- Or manually set `PORT` environment variables

---

## Summary

1. **Port Finding**: `port-finder.js` provides utilities to find available ports
2. **Startup Script**: `start-servers.js` orchestrates startup with health checks
3. **Backend**: Reads port from `PORT` env var (set by startup script)
4. **Frontend**: Uses `-p` flag to specify port
5. **Health Checks**: Backend exposes `/health` endpoint, frontend checked via root path
6. **Mobile**: Uses fixed `API_BASE_URL` from environment files (no port finding needed)

