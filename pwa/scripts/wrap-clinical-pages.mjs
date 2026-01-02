// Quick script to check which pages need wrapping
import fs from 'fs';
import path from 'path';

const pages = [
  'app/appointments/page.tsx',
  'app/appointments/calendar/page.tsx',
  'app/appointments/request/page.tsx',
  'app/billing/page.tsx',
  'app/care-plan/page.tsx',
  'app/hospital-admission/page.tsx',
  'app/medications/refill/page.tsx',
  'app/messages/new/page.tsx',
  'app/messages/[id]/page.tsx',
  'app/messages/voice/page.tsx',
  'app/referrals/page.tsx',
  'app/referrals/request/page.tsx',
  'app/symptom-check/page.tsx',
];

const root = process.cwd();
const needsWrapping = [];

for (const page of pages) {
  const fullPath = path.join(root, page);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('RequirePractice') && !content.includes('from "@/components/RequirePractice"')) {
      needsWrapping.push(page);
    }
  }
}

if (needsWrapping.length) {
  console.log('Pages that need RequirePractice wrapping:');
  needsWrapping.forEach(p => console.log(`  - ${p}`));
} else {
  console.log('✅ All clinical pages are wrapped!');
}

