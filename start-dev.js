#!/usr/bin/env node
/**
 * MyHealthAlly Development Server Startup Script
 * Starts backend, waits for it to be ready, then starts frontend
 * Automatically finds available ports if defaults are in use
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const { findAvailablePort } = require('./port-finder');

// Configuration
const BACKEND_PORT_DEFAULT = 3000;
const FRONTEND_PORT_DEFAULT = 3001;
let BACKEND_PORT = BACKEND_PORT_DEFAULT;
let FRONTEND_PORT = FRONTEND_PORT_DEFAULT;
let BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
let HEALTH_ENDPOINT = `${BACKEND_URL}/health`;
const MAX_WAIT_TIME = 60000; // 60 seconds
const CHECK_INTERVAL = 2000; // 2 seconds

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkBackendHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, { timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend(port) {
  log('⏳ Waiting for backend to start...', 'cyan');
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    if (await checkBackendHealth(port)) {
      log('✅ Backend is ready!', 'green');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    log(`   Checking... (${elapsed}s)`, 'gray');
  }
  
  log(`❌ Backend failed to start within ${MAX_WAIT_TIME / 1000} seconds`, 'red');
  return false;
}

function spawnProcess(name, command, args, cwd, color, options = {}) {
  log(`📦 Starting ${name}...`, 'cyan');
  
  const proc = spawn(command, args, {
    cwd: path.resolve(process.cwd(), cwd),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...options.env },
  });
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => log(`[${name}] ${line}`, color));
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => log(`[${name}] ${line}`, color));
  });
  
  proc.on('error', (error) => {
    log(`❌ Failed to start ${name}: ${error.message}`, 'red');
  });
  
  return proc;
}

async function main() {
  log('🚀 Starting MyHealthAlly Development Servers...', 'cyan');
  log('');
  
  // Find available ports
  log('🔍 Finding available ports...', 'cyan');
  try {
    BACKEND_PORT = await findAvailablePort(BACKEND_PORT_DEFAULT);
    if (BACKEND_PORT !== BACKEND_PORT_DEFAULT) {
      log(`⚠️  Port ${BACKEND_PORT_DEFAULT} in use, using port ${BACKEND_PORT} instead`, 'yellow');
    }
    BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
    HEALTH_ENDPOINT = `${BACKEND_URL}/health`;
    
    FRONTEND_PORT = await findAvailablePort(FRONTEND_PORT_DEFAULT);
    if (FRONTEND_PORT !== FRONTEND_PORT_DEFAULT) {
      log(`⚠️  Port ${FRONTEND_PORT_DEFAULT} in use, using port ${FRONTEND_PORT} instead`, 'yellow');
    }
    
    log(`✅ Using ports: Backend ${BACKEND_PORT}, Frontend ${FRONTEND_PORT}`, 'green');
    log('');
  } catch (error) {
    log(`❌ ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Start backend with port environment variable
  const backendProcess = spawnProcess(
    'Backend',
    'pnpm',
    ['dev'],
    'packages/backend',
    'magenta',
    { env: { PORT: BACKEND_PORT.toString() } }
  );
  
  // Wait for backend to be ready
  const backendReady = await waitForBackend(BACKEND_PORT);
  
  if (!backendReady) {
    log('❌ Failed to start backend. Check logs above.', 'red');
    backendProcess.kill();
    process.exit(1);
  }
  
  // Start frontend with port
  log('');
  const frontendProcess = spawnProcess(
    'Frontend',
    'pnpm',
    ['dev', '-p', FRONTEND_PORT.toString()],
    'packages/web',
    'blue',
    { env: { PORT: FRONTEND_PORT.toString() } }
  );
  
  // Wait a moment for frontend to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check if frontend started
  const frontendAvailable = await findAvailablePort(FRONTEND_PORT);
  if (frontendAvailable !== FRONTEND_PORT) {
    log('✅ Frontend is ready!', 'green');
  } else {
    log('⚠️  Frontend may still be starting...', 'yellow');
  }
  
  // Display status
  log('');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  🎉 Development servers are running!', 'green');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('');
  log(`  Backend API:  ${BACKEND_URL}`, 'bright');
  log(`  Frontend:     http://localhost:${FRONTEND_PORT}`, 'bright');
  log(`  Health Check: ${HEALTH_ENDPOINT}`, 'bright');
  log('');
  log('  Press Ctrl+C to stop all servers', 'gray');
  log('');
  
  // Handle cleanup
  process.on('SIGINT', () => {
    log('');
    log('🛑 Shutting down...', 'yellow');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
  
  // Keep process alive
  process.on('exit', () => {
    backendProcess.kill();
    frontendProcess.kill();
  });
}

main().catch((error) => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
