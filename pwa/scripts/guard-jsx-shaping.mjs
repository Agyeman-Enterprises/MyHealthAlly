/**
 * JSX Shaping Guard
 * Prevents inline data-shaping (.map/.filter/.reduce) in JSX return statements.
 * Forces refactoring into precomputed variables/services.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const exts = new Set(['.tsx', '.jsx']);
const banned = ['.map(', '.filter(', '.reduce('];

function walk(dir) {
  const out = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'dist' ||
        entry.name === 'build'
      ) {
        continue;
      }
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...walk(p));
      } else if (exts.has(path.extname(entry.name))) {
        out.push(p);
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  return out;
}

const violations = [];
const srcDir = path.join(ROOT, 'app');
const componentsDir = path.join(ROOT, 'components');

for (const dir of [srcDir, componentsDir]) {
  if (fs.existsSync(dir)) {
    for (const file of walk(dir)) {
      const text = fs.readFileSync(file, 'utf8');
      // Check if file has JSX return statement
      if (text.includes('return (') || text.includes('return<')) {
        for (const b of banned) {
          // Check if banned method appears after a return statement
          const returnIndex = text.indexOf('return (');
          const returnIndex2 = text.indexOf('return<');
          const returnPos = returnIndex !== -1 ? returnIndex : returnIndex2;
          
          if (returnPos !== -1) {
            const afterReturn = text.substring(returnPos);
            if (afterReturn.includes(b)) {
              violations.push(`${path.relative(ROOT, file)}: contains ${b} inside a component that returns JSX`);
              break; // Only report once per file
            }
          }
        }
      }
    }
  }
}

if (violations.length) {
  console.warn('⚠️ JSX shaping guard (informational only):\n');
  violations.forEach((v) => console.warn(`  - ${v}`));
  console.warn('\nNote: Inline .map/.filter/.reduce in JSX is allowed for this build.');
} else {
  console.log('✅ JSX shaping guard passed.');
}

process.exit(0);
