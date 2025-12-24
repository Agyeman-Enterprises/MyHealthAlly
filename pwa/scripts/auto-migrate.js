/**
 * Auto-Run Supabase Migrations
 * 
 * Uses Supabase client with service role key to execute SQL
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('   Get SERVICE_ROLE_KEY from:');
  console.error('   Supabase Dashboard → Settings → API → service_role (secret)');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFiles = [
  '001_initial_schema.sql',
  '003_missing_tables_safe.sql',  // Use safe version
  '002_test_data_safe.sql',        // Use safe version
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
    // Execute SQL using Supabase RPC (if available) or direct query
    // Note: Supabase doesn't expose raw SQL execution via REST API
    // We'll use the Management API approach via fetch
    
    // Extract project ref from URL
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectRef) {
      throw new Error('Invalid Supabase URL format');
    }

    // Try using Supabase Management API
    // This requires the Management API access token, which we don't have
    // Instead, we'll use a workaround: create a temporary function to execute SQL
    
    // Alternative: Use Supabase's REST API to execute via a stored procedure
    // But first, let's try the direct approach using the PostgREST connection
    
    // Actually, the best way is to use pg (PostgreSQL client) directly
    // But we need to parse the connection string from Supabase URL
    
    // For now, let's use the Supabase client's ability to execute SQL
    // via a custom RPC function or by using the REST API's query endpoint
    
    // Split SQL into statements and execute one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))
      .filter(s => !s.match(/^\s*DO\s+\$\$/i)); // Filter out DO blocks for now
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    // For complex migrations with DO blocks, we need to execute the whole SQL
    // Let's use a different approach: execute via Supabase's SQL editor API
    
    // Actually, Supabase provides a way to execute SQL via the REST API
    // but it requires the Management API token, not the service role key
    
    // Best solution: Use pg library to connect directly to PostgreSQL
    // But we need to install it first
    
    console.log('⚠️  Direct SQL execution via Supabase REST API is not supported');
    console.log('   Attempting alternative method...');
    
    // Try to execute via Supabase client's RPC
    // We'll create a temporary function to execute SQL
    // But this requires the SQL to be wrapped in a function
    
    // For now, let's use the Management API approach with fetch
    const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    const response = await fetch(managementApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        query: sql
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${fileName} - SUCCESS`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ ${fileName} - FAILED`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText.substring(0, 500)}`);
      
      // If Management API doesn't work, try alternative
      if (response.status === 404 || response.status === 401) {
        console.log('\n💡 Management API not available. Using alternative method...');
        return await runMigrationAlternative(fileName, sql);
      }
      
      return false;
    }
  } catch (error) {
    console.error(`❌ ${fileName} - ERROR`);
    console.error(`   ${error.message}`);
    
    // Try alternative method
    return await runMigrationAlternative(fileName, sql);
  }
}

async function runMigrationAlternative(fileName, sql) {
  console.log(`\n🔄 Trying alternative method for: ${fileName}`);
  
  // Use Supabase client to execute SQL via a custom RPC
  // We need to create a function that executes SQL dynamically
  // But Supabase doesn't allow executing arbitrary SQL via RPC for security
  
  // Best alternative: Use pg library to connect directly
  console.log('💡 To auto-run migrations, you need one of:');
  console.log('   1. Supabase CLI installed: `supabase db push`');
  console.log('   2. PostgreSQL client (psql) with connection string');
  console.log('   3. Node.js pg library installed');
  console.log('');
  console.log('   For now, please run migrations manually in Supabase Dashboard');
  console.log('   See: MIGRATION_INSTRUCTIONS.md');
  
  return false;
}

async function runAllMigrations() {
  console.log('🚀 Auto-Running All Supabase Migrations');
  console.log(`📁 Project: ${SUPABASE_URL}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const success = await runMigration(file);
    if (success) {
      successCount++;
      // Small delay between migrations
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    console.log('\n💡 Some migrations failed. You may need to run them manually.');
    console.log('   See: MIGRATION_INSTRUCTIONS.md');
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('   Next: Test your app at http://localhost:3000/provider/dashboard');
  }
}

// Run migrations
runAllMigrations().catch((error) => {
  console.error('\n❌ Migration execution failed');
  console.error(error.message);
  console.log('\n💡 Please run migrations manually in Supabase Dashboard');
  console.log('   See: MIGRATION_INSTRUCTIONS.md');
  process.exit(1);
});

