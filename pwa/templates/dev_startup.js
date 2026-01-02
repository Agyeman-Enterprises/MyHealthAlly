/**
 * Development Startup Orchestration
 * Follows CANON pattern: backend → health check → frontend → health check → browser
 * All processes silent (no popups)
 */

const { spawn } = require('child_process');
const { getPortForService } = require('./port_manager');
const http = require('http');

/**
 * Wait for a health check endpoint to be ready
 * @param {string} url - Health check URL
 * @param {number} maxAttempts - Maximum attempts
 * @param {number} delayMs - Delay between attempts in ms
 * @returns {Promise<boolean>} - True if health check passes
 */
async function waitForHealthCheck(url, maxAttempts = 30, delayMs = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            reject(new Error(`Health check returned ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Health check timeout'));
        });
      });
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

/**
 * Start a process silently
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {object} options - Spawn options
 * @returns {Promise<import('child_process').ChildProcess>} - Child process
 */
function startProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      stdio: 'ignore', // Silent - no popups
      shell: true,
    });

    proc.on('error', reject);
    proc.on('spawn', () => resolve(proc));
  });
}

/**
 * Main orchestration function
 */
async function startDevEnvironment() {
  console.log('🚀 Starting development environment...\n');

  try {
    // Step 1: Start backend
    console.log('1️⃣  Starting backend...');
    const backendPort = await getPortForService('backend');
    const backend = await startProcess('npm', ['run', 'dev:backend'], {
      env: { ...process.env, PORT: backendPort.toString() },
    });
    console.log(`   Backend starting on port ${backendPort}`);

    // Step 2: Wait for backend health check
    console.log('2️⃣  Waiting for backend health check...');
    const backendHealthy = await waitForHealthCheck(`http://localhost:${backendPort}/health`);
    if (!backendHealthy) {
      throw new Error('Backend health check failed');
    }
    console.log('   ✅ Backend is healthy\n');

    // Step 3: Start frontend
    console.log('3️⃣  Starting frontend...');
    const frontendPort = await getPortForService('frontend');
    const frontend = await startProcess('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: frontendPort.toString() },
    });
    console.log(`   Frontend starting on port ${frontendPort}`);

    // Step 4: Wait for frontend health check
    console.log('4️⃣  Waiting for frontend health check...');
    const frontendHealthy = await waitForHealthCheck(`http://localhost:${frontendPort}/health`);
    if (!frontendHealthy) {
      throw new Error('Frontend health check failed');
    }
    console.log('   ✅ Frontend is healthy\n');

    // Step 5: Open browser
    console.log('5️⃣  Opening browser...');
    const open = require('open');
    await open(`http://localhost:${frontendPort}`);
    console.log('   ✅ Browser opened\n');

    console.log('✅ Development environment ready!');
    console.log(`   Frontend: http://localhost:${frontendPort}`);
    console.log(`   Backend: http://localhost:${backendPort}\n`);

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  startDevEnvironment();
}

module.exports = { startDevEnvironment, waitForHealthCheck };

