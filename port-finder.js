/**
 * Port Finder Utility
 * Finds available ports starting from a base port
 */

const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

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

async function findAvailablePorts(count, startPort, maxAttempts = 100) {
  const ports = [];
  let currentPort = startPort;
  let attempts = 0;
  
  while (ports.length < count && attempts < maxAttempts) {
    const available = await checkPort(currentPort);
    if (available) {
      ports.push(currentPort);
    }
    currentPort++;
    attempts++;
  }
  
  if (ports.length < count) {
    throw new Error(`Only found ${ports.length} of ${count} available ports`);
  }
  
  return ports;
}

module.exports = { findAvailablePort, findAvailablePorts, checkPort };

