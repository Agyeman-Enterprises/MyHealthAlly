#!/usr/bin/env node
/**
 * Auto-start script - runs automatically after install
 * Uses the unified startup script to start servers
 */

const http = require('http');
const { findAvailablePort } = require('./port-finder');

async function checkHealth(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  // Check if servers are already running on default ports
  const backendPort = 3000;
  const frontendPort = 3001;
  
  const backendRunning = await checkHealth(`http://localhost:${backendPort}/health`);
  const frontendRunning = await checkHealth(`http://localhost:${frontendPort}`);
  
  if (backendRunning && frontendRunning) {
    return;
  }
}

main().catch(() => {
  // Silently fail - startup will happen automatically via dev/start scripts
});

