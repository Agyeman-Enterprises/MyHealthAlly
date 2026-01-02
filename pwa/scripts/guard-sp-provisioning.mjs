// scripts/guard-sp-provisioning.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ALLOWED_FILES = new Set([
  'lib/attachPractice.ts',
  'lib/api/solopractice-client.ts',
  'app/api/solopractice/patients/create-or-get/route.ts',
]);

const TARGET_PATTERNS = [
  '/patients/create-or-get',
  'createOrGetPatient(',
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
      out.push(...walk(full));
    } else {
      if (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js') || full.endsWith('.mjs')) out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);

let violations = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replaceAll('\\', '/');
  
  // Skip guard scripts themselves
  if (rel.startsWith('scripts/guard-')) continue;
  
  const content = fs.readFileSync(file, 'utf8');

  for (const pat of TARGET_PATTERNS) {
    if (content.includes(pat)) {
      const allowed = [...ALLOWED_FILES].some((allowedRel) => rel === allowedRel);
      if (!allowed) {
        violations.push({ rel, pat });
      }
    }
  }
}

if (violations.length) {
  console.error('❌ SP provisioning guard failed. Found forbidden usage:');
  for (const v of violations) {
    console.error(` - ${v.rel} contains ${JSON.stringify(v.pat)}`);
  }
  console.error('\nOnly these files may reference SP provisioning:');
  for (const f of ALLOWED_FILES) console.error(` - ${f}`);
  process.exit(1);
}

console.log('✅ SP provisioning guard passed.');

