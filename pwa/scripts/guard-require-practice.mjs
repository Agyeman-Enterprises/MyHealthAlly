// scripts/guard-require-practice.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// These are the clinical routes that MUST have RequirePractice gates
// NOTE: /vitals and /symptom-check are NOT in this list - they support dual mode (local/clinical)
// NOTE: /labs, /medications, and /care-plan are wellness-first (no gate required) per new architecture
const CLINICAL_ROUTE_HINTS = [
  'app/messages',
  'app/appointments',
  'app/referrals',
  'app/billing',
  'app/hospital-admission',
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
      if (full.endsWith('page.tsx') || full.endsWith('page.ts')) out.push(full);
    }
  }
  return out;
}

const pages = walk(path.join(ROOT, 'app')).map((p) => path.relative(ROOT, p).replaceAll('\\', '/'));

const clinicalPages = pages.filter((p) => CLINICAL_ROUTE_HINTS.some((hint) => p.startsWith(hint)));

let violations = [];
for (const page of clinicalPages) {
  const content = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const hasGate =
    content.includes('RequirePractice') ||
    content.includes('<RequirePractice') ||
    content.includes('from "@/components/RequirePractice"');

  if (!hasGate) violations.push(page);
}

if (violations.length) {
  console.error('❌ RequirePractice guard failed. These clinical pages are not gated:');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log('✅ RequirePractice guard passed.');

