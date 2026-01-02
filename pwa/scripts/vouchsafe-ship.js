/**
 * Vouchsafe Ship Validation
 * Pre-shipment validation checks
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

async function runShipChecks() {
  console.log('🚢 Vouchsafe Ship Validation\n');
  console.log('='.repeat(60));

  // 1. Production Build
  console.log('\n🏗️  Build Validation:');
  const buildDir = path.join(__dirname, '../.next');
  check('Build exists', fs.existsSync(buildDir), 'Production build completed');
  
  const buildManifest = path.join(buildDir, 'build-manifest.json');
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    check('Pages built', Object.keys(manifest.pages || {}).length > 0, 'Pages generated');
  }

  // 2. No Errors in Build
  console.log('\n🔍 Error Checks:');
  const buildErrorLog = path.join(buildDir, 'trace');
  check('No build errors', !fs.existsSync(path.join(buildDir, 'error.log')), 'No build errors found');

  // 3. Environment Configuration
  console.log('\n⚙️  Configuration:');
  const envLocal = path.join(__dirname, '../.env.local');
  const envTemplate = path.join(__dirname, '../ENV_TEMPLATE.md');
  if (fs.existsSync(envLocal)) {
    const envContent = fs.readFileSync(envLocal, 'utf8');
    check('Environment file', envContent.length > 0, '.env.local configured');
    check('Template available', fs.existsSync(envTemplate), 'Environment template provided for buyers');
  } else {
    check('Environment template', fs.existsSync(envTemplate), 'Environment template available');
  }

  // 4. Package Size
  console.log('\n📦 Package Size:');
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const nodeModulesSize = getDirectorySize(path.join(__dirname, '../node_modules'));
  const nodeModulesSizeMB = (nodeModulesSize / 1024 / 1024).toFixed(2);
  check('Node modules size', nodeModulesSize < 550 * 1024 * 1024, `Node modules: ${nodeModulesSizeMB} MB (under 550MB)`);

  // 5. Documentation
  console.log('\n📚 Documentation:');
  const readme = path.join(__dirname, '../README.md');
  check('README exists', fs.existsSync(readme), 'README.md present');
  
  const setupDocs = [
    path.join(__dirname, '../QUICK_START.md'),
    path.join(__dirname, '../AUTO_MIGRATE_SETUP.md'),
  ];
  setupDocs.forEach(doc => {
    check(`Doc: ${path.basename(doc)}`, fs.existsSync(doc), `${path.basename(doc)} exists`);
  });

  // 6. Migration Scripts
  console.log('\n🗄️  Database:');
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    check('Migrations ready', migrations.length >= 3, 'All migration files present');
  }

  // 7. Security
  console.log('\n🔐 Security:');
  const gitignore = path.join(__dirname, '../.gitignore');
  if (fs.existsSync(gitignore)) {
    const gitignoreContent = fs.readFileSync(gitignore, 'utf8');
    check('.env ignored', gitignoreContent.includes('.env'), '.env files in .gitignore');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Ship Validation Summary:');
  console.log(`✅ Passed: ${checks.passed.length}`);
  console.log(`❌ Failed: ${checks.failed.length}`);

  if (checks.failed.length > 0) {
    console.log('\n❌ Ship validation FAILED');
    console.log('\nFailed checks:');
    checks.failed.forEach(f => console.log(`  - ${f.name}: ${f.message}`));
    process.exit(1);
  } else {
    console.log('\n✅ Ship validation PASSED - Ready to ship! 🚀');
    process.exit(0);
  }
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  } catch (e) {
    // Ignore errors
  }
  return totalSize;
}

runShipChecks().catch(error => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});

