/**
 * Run All Supabase Migrations
 * 
 * This script attempts to run migrations via Supabase Management API
 * Requires: SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL in .env.local
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFiles = [
  '001_initial_schema.sql',
  '003_missing_tables.sql',
  '002_test_data.sql',
];

async function runMigration(fileName) {
  const filePath = path.join(migrationsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${fileName}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`\n📄 Running: ${fileName}`);
  console.log(`   SQL length: ${sql.length} characters`);

  try {
    // Use Supabase Management API to execute SQL
    // Note: This requires the project to have SQL execution enabled
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (response.ok) {
      console.log(`✅ ${fileName} - SUCCESS`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ ${fileName} - FAILED`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${fileName} - ERROR`);
    console.error(`   ${error.message}`);
    return false;
  }
}

async function runAllMigrations() {
  console.log('🚀 Running All Supabase Migrations');
  console.log(`📁 Project: ${projectRef}`);
  console.log(`🔗 URL: ${SUPABASE_URL}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const success = await runMigration(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log(`\n⚠️  Stopping after failure. Fix errors and run remaining migrations manually.`);
      break;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${successCount}/${migrationFiles.length}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
    console.log('\n💡 Alternative: Run migrations manually in Supabase Dashboard');
    console.log('   See: RUN_ALL_MIGRATIONS.md');
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('   Next: Test your app at http://localhost:3000/provider/dashboard');
  }
}

// Try alternative method using PostgREST
async function runMigrationAlternative(fileName) {
  const filePath = path.join(migrationsDir, fileName);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n📄 Running: ${fileName} (${statements.length} statements)`);

  // Note: Supabase doesn't expose raw SQL execution via REST API
  // This is a placeholder - actual execution must be done via Dashboard
  console.log('⚠️  Supabase REST API does not support raw SQL execution');
  console.log('   Please run migrations manually in Supabase Dashboard');
  return false;
}

// Check if we can use Management API
if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
  runAllMigrations().catch((error) => {
    console.error('\n❌ Migration execution failed');
    console.error(error.message);
    console.log('\n💡 Supabase Management API may not support SQL execution');
    console.log('   Please run migrations manually:');
    console.log('   1. Go to: https://app.supabase.com');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Copy/paste each migration file');
    console.log('   4. Click Run');
    process.exit(1);
  });
} else {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

