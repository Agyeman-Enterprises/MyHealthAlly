/**
 * AI Configuration Diagnostic
 * Checks if AI service is properly configured
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Checking AI Service Configuration...\n');

// Check for .env.local file
const envPath = join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = readFileSync(envPath, 'utf8');
  console.log('✅ Found .env.local file');
} catch (err) {
  console.log('⚠️  .env.local file not found');
  console.log('   Create .env.local in the pwa/ directory');
}

// Check for ANTHROPIC_API_KEY
const hasApiKey = envContent.includes('ANTHROPIC_API_KEY=') && 
                  envContent.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim() !== '';

if (hasApiKey) {
  const keyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
  const keyValue = keyMatch?.[1]?.trim() || '';
  
  if (keyValue && keyValue.length > 10) {
    console.log('✅ ANTHROPIC_API_KEY is set');
    console.log(`   Key length: ${keyValue.length} characters`);
    console.log(`   Key preview: ${keyValue.substring(0, 8)}...`);
  } else {
    console.log('❌ ANTHROPIC_API_KEY is empty or invalid');
    console.log('   Set ANTHROPIC_API_KEY=your_key_here in .env.local');
  }
} else {
  console.log('❌ ANTHROPIC_API_KEY is not set');
  console.log('   Add this line to .env.local:');
  console.log('   ANTHROPIC_API_KEY=your_anthropic_api_key_here');
}

console.log('\n📝 What the "AI service is currently unavailable" message means:');
console.log('   This is a GRACEFUL FALLBACK, not a glitch.');
console.log('   It appears when ANTHROPIC_API_KEY is missing or invalid.');
console.log('   The system checks for the API key before making any AI calls.');
console.log('   This prevents errors and provides a user-friendly message.');

console.log('\n🔧 To fix:');
console.log('   1. Get an API key from https://console.anthropic.com/');
console.log('   2. Add ANTHROPIC_API_KEY=your_key to .env.local');
console.log('   3. Restart your dev server (npm run dev)');

console.log('\n💡 Note: The AI service is optional.');
console.log('   The app will work without it, but AI chat features will be unavailable.');
