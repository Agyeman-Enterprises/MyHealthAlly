#!/usr/bin/env node
/**
 * MyHealthAlly – Unified Startup Script
 * -------------------------------------
 * ✔ Finds available backend + frontend ports
 * ✔ Starts backend
 * ✔ Waits for backend health check
 * ✔ Starts frontend
 * ✔ Waits for frontend to be reachable
 * ✔ Reports success with final URLs
 * ✔ Gracefully exits on any failure with clear message
 */

const { findAvailablePort } = require("./port-finder");
const { spawn } = require("child_process");
const http = require("http");

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  magenta: "\x1b[35m",
};

// CONFIG
const BACKEND_DIR = "packages/backend";
const FRONTEND_DIR = "packages/web";
const BACKEND_HEALTH = "/health";
const FRONTEND_PATH = "/";
const RETRIES = 40; // ~20 sec
const INTERVAL = 500;

/* -----------------------------------------------------
   Utility: waitForURL
----------------------------------------------------- */
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

    process.stdout.write(
      `${colors.cyan}• Waiting for ${name}… (${i + 1}/${RETRIES})${colors.reset}\r`
    );
    await new Promise((r) => setTimeout(r, INTERVAL));
  }
  return false;
}

/* -----------------------------------------------------
   Utility: startProcess
----------------------------------------------------- */
function startProcess(cmd, args, cwd, tag, env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: "inherit",
      env: { ...process.env, ...env },
    });

    // If it exits early, fail startup
    proc.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`${tag} exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`${tag} failed to start: ${err.message}`));
    });

    // Resolve immediately — actual readiness is checked via health checks
    setTimeout(() => resolve(proc), 1000);
  });
}

/* -----------------------------------------------------
   Main
----------------------------------------------------- */
(async function main() {
  console.log(`${colors.cyan}🔍 Finding available ports...${colors.reset}`);

  const backendPort = await findAvailablePort(3000);
  // Ensure frontend port is different from backend port
  let frontendPort = await findAvailablePort(3001);
  if (frontendPort === backendPort) {
    frontendPort = await findAvailablePort(backendPort + 1);
  }
  
  // Double-check they're different
  if (frontendPort === backendPort) {
    console.error(`${colors.red}❌ Error: Frontend and backend ports cannot be the same!${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.green}✔ Backend port:${colors.reset} ${backendPort}`);
  console.log(`${colors.green}✔ Frontend port:${colors.reset} ${frontendPort}`);

  console.log(`${colors.cyan}\n🚀 Starting backend...${colors.reset}`);
  let backendProc;
  try {
    backendProc = await startProcess(
      "pnpm",
      ["dev"],
      BACKEND_DIR,
      "backend",
      { PORT: backendPort.toString() }
    );
  } catch (err) {
    console.error(
      `${colors.red}❌ Failed to start backend:${colors.reset} ${err.message}`
    );
    process.exit(1);
  }

  const backendURL = `http://localhost:${backendPort}${BACKEND_HEALTH}`;
  console.log(
    `${colors.cyan}\n⏳ Waiting for backend health check...${colors.reset}`
  );

  const backendUp = await waitForURL(backendURL, "backend");
  if (!backendUp) {
    console.error(
      `${colors.red}❌ Backend did not become healthy in time.${colors.reset}`
    );
    if (backendProc) backendProc.kill();
    process.exit(1);
  }

  console.log(
    `${colors.green}✔ Backend is UP at:${colors.reset} http://localhost:${backendPort}`
  );

  console.log(`${colors.cyan}\n🚀 Starting frontend...${colors.reset}`);
  let frontendProc;
  try {
    frontendProc = await startProcess(
      "pnpm",
      ["dev", "-p", frontendPort.toString()],
      FRONTEND_DIR,
      "frontend"
    );
  } catch (err) {
    console.error(
      `${colors.red}❌ Failed to start frontend:${colors.reset} ${err.message}`
    );
    if (backendProc) backendProc.kill();
    process.exit(1);
  }

  const frontendURL = `http://localhost:${frontendPort}${FRONTEND_PATH}`;
  console.log(
    `${colors.cyan}\n⏳ Waiting for frontend to respond...${colors.reset}`
  );

  const frontendUp = await waitForURL(frontendURL, "frontend");
  if (!frontendUp) {
    console.error(
      `${colors.red}❌ Frontend did not become reachable in time.${colors.reset}`
    );
    if (backendProc) backendProc.kill();
    if (frontendProc) frontendProc.kill();
    process.exit(1);
  }

  console.log(`
${colors.green}═══════════════════════════════════════════════════════════
    🎉 Servers Running Successfully!
═══════════════════════════════════════════════════════════${colors.reset}

  Backend:  ${colors.cyan}http://localhost:${backendPort}${colors.reset}
  Frontend: ${colors.cyan}http://localhost:${frontendPort}${colors.reset}

${colors.green}Both services are healthy and ready.${colors.reset}

${colors.yellow}Press Ctrl+C to stop all servers${colors.reset}
`);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(`\n${colors.yellow}🛑 Shutting down...${colors.reset}`);
    if (backendProc) backendProc.kill();
    if (frontendProc) frontendProc.kill();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    if (backendProc) backendProc.kill();
    if (frontendProc) frontendProc.kill();
    process.exit(0);
  });
})();
