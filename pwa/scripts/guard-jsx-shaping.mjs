/**
 * JSX purity guard (advisory).
 * Does NOT block verify; only surfaces obvious side effects inside JSX returns.
 * Iteration (.map/.filter/.reduce) is allowed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const exts = new Set(['.tsx', '.jsx']);
const sideEffects = ['console.', 'await ', 'async ', '.then(', '.catch(', '++', '--', '+=', '-=', '*=', '/='];

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

const warnings = [];
const scanRoots = ['app', 'components', 'src']
  .map((d) => path.join(ROOT, d))
  .filter((p) => fs.existsSync(p));

for (const dir of scanRoots) {
  for (const file of walk(dir)) {
    const text = fs.readFileSync(file, 'utf8');
    const returnIndex = text.indexOf('return (');
    const returnIndex2 = text.indexOf('return<');
    const pos = returnIndex !== -1 ? returnIndex : returnIndex2;
    if (pos === -1) continue;
    const after = text.substring(pos);
    for (const token of sideEffects) {
      if (after.includes(token)) {
        warnings.push(`${path.relative(ROOT, file)}: possible side-effect token "${token.trim()}" in JSX return`);
        break;
      }
    }
  }
}

if (warnings.length) {
  console.warn('⚠️ JSX purity (advisory only):');
  warnings.forEach((w) => console.warn(`  - ${w}`));
  console.warn('Iteration (.map/.filter/.reduce) is allowed. This check does not block verify.');
} else {
  console.log('✅ JSX purity check: no obvious side effects found in JSX returns.');
}

process.exit(0);
