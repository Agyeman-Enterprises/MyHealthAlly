#!/usr/bin/env node
/**
 * MyHealthAlly Automated Setup Script
 * Installs dependencies, sets up environment, and starts servers
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { findAvailablePort } = require('./port-finder');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      cwd: options.cwd || process.cwd(),
      ...options 
    });
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
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

async function waitForBackend(port, maxWait = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (await checkBackendHealth(port)) return true;
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

async function main() {
  log('🚀 MyHealthAlly Automated Setup', 'cyan');
  log('');

  // Step 1: Install dependencies
  log('📦 Installing dependencies...', 'cyan');
  exec('pnpm install');
  log('✅ Dependencies installed', 'green');
  log('');

  // Step 2: Check environment files
  log('🔧 Checking environment configuration...', 'cyan');
  const backendEnv = path.join('packages', 'backend', '.env');
  const webEnv = path.join('packages', 'web', '.env');
  
  if (!fs.existsSync(backendEnv)) {
    log('⚠️  Backend .env not found. Creating from example...', 'yellow');
    if (fs.existsSync(backendEnv + '.example')) {
      fs.copyFileSync(backendEnv + '.example', backendEnv);
      log('✅ Created backend/.env', 'green');
    }
  }
  
  if (!fs.existsSync(webEnv)) {
    log('⚠️  Web .env not found. Creating from example...', 'yellow');
    if (fs.existsSync(webEnv + '.example')) {
      fs.copyFileSync(webEnv + '.example', webEnv);
      log('✅ Created web/.env', 'green');
    }
  }
  log('');

  // Step 3: Generate Prisma client
  log('🗄️  Setting up database...', 'cyan');
  exec('pnpm prisma generate', { cwd: 'packages/backend' });
  log('✅ Database setup complete', 'green');
  log('');

  // Step 4: Find available ports
  log('🔍 Finding available ports...', 'cyan');
  let backendPort = 3000;
  let frontendPort = 3001;
  
  try {
    backendPort = await findAvailablePort(3000);
    if (backendPort !== 3000) {
      log(`⚠️  Port 3000 in use, using port ${backendPort} instead`, 'yellow');
    }
    
    frontendPort = await findAvailablePort(3001);
    if (frontendPort !== 3001) {
      log(`⚠️  Port 3001 in use, using port ${frontendPort} instead`, 'yellow');
    }
    
    log(`✅ Using ports: Backend ${backendPort}, Frontend ${frontendPort}`, 'green');
    log('');
  } catch (error) {
    log(`❌ ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Step 5: Start servers
  log('🎯 Starting development servers...', 'cyan');
  log('');
  
  // Start backend with port
  const backend = spawn('pnpm', ['dev'], {
    cwd: path.join(process.cwd(), 'packages', 'backend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, PORT: backendPort.toString() },
  });

  backend.stdout.on('data', (data) => {
    process.stdout.write(`${colors.magenta}[Backend]${colors.reset} ${data}`);
  });

  backend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.magenta}[Backend]${colors.reset} ${data}`);
  });

  // Wait for backend
  log('⏳ Waiting for backend to be ready...', 'cyan');
  const backendReady = await waitForBackend(backendPort);
  
  if (!backendReady) {
    log('❌ Backend failed to start', 'red');
    backend.kill();
    process.exit(1);
  }
  
  log('✅ Backend is ready!', 'green');
  log('');

  // Start frontend with port
  const frontend = spawn('pnpm', ['dev', '-p', frontendPort.toString()], {
    cwd: path.join(process.cwd(), 'packages', 'web'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, PORT: frontendPort.toString() },
  });

  frontend.stdout.on('data', (data) => {
    process.stdout.write(`${colors.blue}[Frontend]${colors.reset} ${data}`);
  });

  frontend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.blue}[Frontend]${colors.reset} ${data}`);
  });

  // Wait a moment for frontend
  await new Promise(r => setTimeout(r, 3000));

  // Display success
  log('');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  🎉 MyHealthAlly is running!', 'green');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('');
  log(`  Backend API:  http://localhost:${backendPort}`, 'reset');
  log(`  Frontend:     http://localhost:${frontendPort}`, 'reset');
  log(`  Health Check: http://localhost:${backendPort}/health`, 'reset');
  log('');
  log('  Press Ctrl+C to stop', 'gray');
  log('');

  // Cleanup on exit
  process.on('SIGINT', () => {
    log('');
    log('🛑 Shutting down...', 'yellow');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

main().catch((error) => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

