/**
 * Vouchsafe Production Validation
 * Comprehensive production readiness checks
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

function check(name, condition, message) {
  if (condition) {
    checks.passed.push({ name, message });
    console.log(`✅ ${name}: ${message}`);
  } else {
    checks.failed.push({ name, message });
    console.error(`❌ ${name}: ${message}`);
  }
}

function warn(name, message) {
  checks.warnings.push({ name, message });
  console.warn(`⚠️  ${name}: ${message}`);
}

async function runProductionChecks() {
  console.log('🔍 Vouchsafe Production Validation\n');
  console.log('='.repeat(60));

  // 1. Environment Variables
  console.log('\n📋 Environment Variables:');
  const envLocal = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envLocal)) {
    const envContent = fs.readFileSync(envLocal, 'utf8');
    check('NEXT_PUBLIC_SUPABASE_URL', envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && !envContent.includes('placeholder'), 'Supabase URL configured');
    check('NEXT_PUBLIC_SUPABASE_ANON_KEY', envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') && !envContent.includes('placeholder'), 'Supabase key configured');
    check('DATABASE_URL', envContent.includes('DATABASE_URL'), 'Database connection string configured');
  } else {
    check('Environment file', false, '.env.local not found');
  }

  // 2. Build Status
  console.log('\n🏗️  Build Status:');
  const buildDir = path.join(__dirname, '../.next');
  check('Production build', fs.existsSync(buildDir), 'Build directory exists');
  
  // 3. Type Safety
  console.log('\n🔒 Type Safety:');
  const tsConfig = path.join(__dirname, '../tsconfig.json');
  if (fs.existsSync(tsConfig)) {
    const tsConfigContent = JSON.parse(fs.readFileSync(tsConfig, 'utf8'));
    check('Strict mode', tsConfigContent.compilerOptions?.strict === true, 'TypeScript strict mode enabled');
    check('No emit', tsConfigContent.compilerOptions?.noEmit === true, 'Type checking enabled');
  }

  // 4. Security
  console.log('\n🔐 Security:');
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  check('No exposed secrets', !JSON.stringify(packageJson).includes('password') && !JSON.stringify(packageJson).includes('secret'), 'No secrets in package.json');
  
  // 5. Dependencies
  console.log('\n📦 Dependencies:');
  check('Supabase client', packageJson.dependencies?.['@supabase/supabase-js'], 'Supabase client installed');
  check('React Query', packageJson.dependencies?.['@tanstack/react-query'], 'React Query installed');
  check('Zustand', packageJson.dependencies?.zustand, 'State management installed');

  // 6. Migration Files
  console.log('\n🗄️  Database Migrations:');
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    check('Migration files exist', migrations.length > 0, `${migrations.length} migration files found`);
    check('Safe migrations', migrations.some(f => f.includes('safe')), 'Safe migration versions available');
  }

  // 7. PWA Configuration
  console.log('\n📱 PWA Configuration:');
  check('PWA package', packageJson.dependencies?.['next-pwa'], 'next-pwa installed');
  const publicDir = path.join(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    check('Service worker', fs.existsSync(path.join(publicDir, 'sw.js')), 'Service worker generated');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Passed: ${checks.passed.length}`);
  console.log(`❌ Failed: ${checks.failed.length}`);
  console.log(`⚠️  Warnings: ${checks.warnings.length}`);

  if (checks.failed.length > 0) {
    console.log('\n❌ Production validation FAILED');
    console.log('\nFailed checks:');
    checks.failed.forEach(f => console.log(`  - ${f.name}: ${f.message}`));
    process.exit(1);
  } else {
    console.log('\n✅ Production validation PASSED');
    if (checks.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      checks.warnings.forEach(w => console.log(`  - ${w.name}: ${w.message}`));
    }
    process.exit(0);
  }
}

runProductionChecks().catch(error => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});

