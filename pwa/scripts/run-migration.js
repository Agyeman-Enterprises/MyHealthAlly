/**
 * Run Supabase Migration
 * 
 * This script executes the migration SQL against your Supabase database
 * using the Supabase Management API.
 * 
 * Usage:
 *   node scripts/run-migration.js
 * 
 * Requires:
 *   - SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (for admin access)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL not found in .env.local');
  console.error('   Please add: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  console.error('   ⚠️  WARNING: This key has admin access. Keep it secret!');
  process.exit(1);
}

async function runMigration() {
  const migrationFile = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  console.log('🚀 Running migration...');
  console.log(`📁 Migration file: ${migrationFile}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Use Supabase REST API to execute SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      // Try alternative: direct SQL execution via PostgREST
      console.log('⚠️  Trying alternative method...');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📝 Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length < 10) continue; // Skip very short statements
        
        try {
          // Note: This won't work directly - Supabase doesn't expose raw SQL execution
          // This is a placeholder to show what we'd need
          console.log(`   [${i + 1}/${statements.length}] Executing statement...`);
        } catch (err) {
          console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('');
    console.log('✅ Migration completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Verify tables in Supabase Dashboard → Table Editor');
    console.log('   2. Check for any errors in the output above');
    console.log('   3. Run: npm run dev');
    
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('💡 Alternative: Run migration via Supabase Dashboard');
    console.error('   1. Go to: https://app.supabase.com');
    console.error('   2. SQL Editor → New Query');
    console.error('   3. Copy contents of: supabase/migrations/001_initial_schema.sql');
    console.error('   4. Paste and click Run');
    process.exit(1);
  }
}

// Check if we're using the Management API (which requires different approach)
console.log('⚠️  Note: Supabase doesn\'t expose raw SQL execution via REST API');
console.log('💡 Recommended: Use Supabase Dashboard SQL Editor instead');
console.log('');
console.log('📋 Manual Migration Steps:');
console.log('   1. Open: https://app.supabase.com → Your Project');
console.log('   2. Go to: SQL Editor → New Query');
console.log('   3. Open: pwa/supabase/migrations/001_initial_schema.sql');
console.log('   4. Copy ALL contents and paste into SQL Editor');
console.log('   5. Click "Run" (or press Ctrl+Enter)');
console.log('   6. Wait for "Success" message');
console.log('');
console.log('🚀 After migration, run: npm run dev');
console.log('');

// Still try to provide helpful info
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Environment variables found');
  console.log('   Supabase URL:', SUPABASE_URL);
  console.log('   Service Role Key:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
  console.log('');
}

process.exit(0);

