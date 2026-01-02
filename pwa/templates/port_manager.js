/**
 * Port Manager
 * Manages port allocation to avoid conflicts.
 * NEVER hardcode ports (3000, 5000, 8080) - use this instead.
 */

const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * Find an available port starting from a base port
 * @param {number} basePort - Starting port number
 * @param {number} maxAttempts - Maximum attempts to find a port
 * @returns {Promise<number>} - Available port number
 */
async function findAvailablePort(basePort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`Could not find available port starting from ${basePort}`);
}

/**
 * Get port for a specific service
 * @param {string} service - Service name (e.g., 'frontend', 'backend', 'api')
 * @returns {Promise<number>} - Port number for the service
 */
async function getPortForService(service) {
  const portMap = {
    frontend: 3000,
    backend: 5000,
    api: 8080,
  };

  const basePort = portMap[service];
  if (!basePort) {
    throw new Error(`Unknown service: ${service}`);
  }

  return await findAvailablePort(basePort);
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
  getPortForService,
};

