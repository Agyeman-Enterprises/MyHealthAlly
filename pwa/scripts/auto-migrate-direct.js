/**
 * Auto-Run Supabase Migrations - Direct PostgreSQL Connection
 * 
 * Uses pg library to connect directly to PostgreSQL and execute SQL
 * Requires: DATABASE_URL or connection string in .env.local
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Check if pg is installed
let pg;
try {
  pg = require('pg');
} catch (e) {
  console.error('❌ pg library not installed');
  console.error('   Install: npm install pg');
  console.error('   Or use: npm install --save-dev pg');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// Build connection string from Supabase URL if DATABASE_URL not provided
let connectionString = DATABASE_URL;

if (!connectionString && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  // Extract project ref and build direct PostgreSQL connection string
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (projectRef) {
    // Supabase direct connection format:
    // postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    // But we need the password from service role key or a separate DB password
    
    console.error('❌ DATABASE_URL not found in .env.local');
    console.error('');
    console.error('   To auto-run migrations, you need:');
    console.error('   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres');
    console.error('');
    console.error('   Get connection string from:');
    console.error('   Supabase Dashboard → Settings → Database → Connection string');
    console.error('   Use "Connection pooling" → "Transaction" mode');
    console.error('');
    console.error('   Or install Supabase CLI and use: supabase db push');
    process.exit(1);
  }
}

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFiles = [
  '001_initial_schema.sql',
  '003_missing_tables_safe.sql',
  '002_test_data_safe.sql',
];

async function runMigration(fileName, client) {
  const filePath = path.join(migrationsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${fileName}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`\n📄 Running: ${fileName}`);
  console.log(`   SQL length: ${sql.length} characters`);

  try {
    // Execute SQL directly
    await client.query(sql);
    console.log(`✅ ${fileName} - SUCCESS`);
    return true;
  } catch (error) {
    console.error(`❌ ${fileName} - FAILED`);
    console.error(`   Error: ${error.message}`);
    
    // Check if it's a "already exists" error - that's okay for safe migrations
    if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
      console.log(`   ⚠️  Table/data already exists - this is OK for safe migrations`);
      return true; // Treat as success for safe migrations
    }
    
    return false;
  }
}

async function runAllMigrations() {
  console.log('🚀 Auto-Running All Supabase Migrations');
  console.log(`📁 Using direct PostgreSQL connection`);
  console.log('');

  const client = new pg.Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Supabase requires SSL
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    let successCount = 0;
    let failCount = 0;

    for (const file of migrationFiles) {
      const success = await runMigration(file, client);
      if (success) {
        successCount++;
        // Small delay between migrations
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        failCount++;
        console.log(`\n⚠️  Migration failed: ${file}`);
        console.log('   Continuing with next migration...');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successful: ${successCount}/${migrationFiles.length}`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount}`);
    } else {
      console.log('\n🎉 All migrations completed successfully!');
      console.log('   Next: Test your app at http://localhost:3000/provider/dashboard');
    }
  } catch (error) {
    console.error('\n❌ Connection failed');
    console.error(error.message);
    console.log('\n💡 Check your DATABASE_URL in .env.local');
  } finally {
    await client.end();
  }
}

// Run migrations
runAllMigrations().catch((error) => {
  console.error('\n❌ Migration execution failed');
  console.error(error.message);
  process.exit(1);
});

