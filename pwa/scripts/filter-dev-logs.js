#!/usr/bin/env node

/**
 * Filter script to reduce noise in Next.js dev server logs
 * Filters out:
 * - 404 errors for app-build-manifest.json (normal in dev)
 * - 404 errors for webpack hot-update.json (normal in dev)
 * - Fast Refresh warnings (informational)
 */

const { spawn } = require('child_process');

const filterPatterns = [
  /GET \/_next\/app-build-manifest\.json 404/,
  /GET \/_next\/static\/webpack\/.*\.webpack\.hot-update\.json 404/,
  /Fast Refresh had to perform a full reload/,
];

function shouldFilterLine(line) {
  return filterPatterns.some(pattern => pattern.test(line));
}

// Spawn Next.js dev server
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  cwd: process.cwd(),
});

// Filter stdout
nextDev.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (!shouldFilterLine(line)) {
      process.stdout.write(line + '\n');
    }
  });
});

// Filter stderr
nextDev.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (!shouldFilterLine(line)) {
      process.stderr.write(line + '\n');
    }
  });
});

// Handle process exit
nextDev.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});
