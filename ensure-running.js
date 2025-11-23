#!/usr/bin/env node
/**
 * Ensure servers are running - with better error handling
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
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

function checkHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(port, maxWait = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    const available = await findAvailablePort(port);
    if (available !== port) {
      return true; // Port is in use, server is running
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  log('🔍 Checking server status...', 'cyan');
  
  // Check if servers are already running
  const backendRunning = await checkHealth(3000) || await checkHealth(3001) || await checkHealth(3002);
  const frontendRunning = await waitForPort(3001, 2000) || await waitForPort(3002, 2000);
  
  if (backendRunning || frontendRunning) {
    log('✅ Servers appear to be running!', 'green');
    log('   Try: http://localhost:3001', 'gray');
    return;
  }
  
  log('🚀 Starting servers...', 'cyan');
  require('./start-dev.js');
}

main().catch(console.error);

