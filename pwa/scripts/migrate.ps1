# PowerShell script to help with Supabase migration
# This opens the migration file and provides instructions

Write-Host "🚀 MyHealthAlly Supabase Migration Helper" -ForegroundColor Cyan
Write-Host ""

$migrationFile = Join-Path $PSScriptRoot "..\supabase\migrations\001_initial_schema.sql"

if (Test-Path $migrationFile) {
    Write-Host "✅ Migration file found: $migrationFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Migration Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open: https://app.supabase.com" -ForegroundColor White
    Write-Host "   2. Select your project" -ForegroundColor White
    Write-Host "   3. Go to: SQL Editor → New Query" -ForegroundColor White
    Write-Host "   4. Opening migration file..." -ForegroundColor White
    Write-Host ""
    
    # Open the migration file
    Start-Process notepad.exe $migrationFile
    
    Write-Host "📝 Instructions:" -ForegroundColor Yellow
    Write-Host "   - Copy ALL contents from the opened file" -ForegroundColor White
    Write-Host "   - Paste into Supabase SQL Editor" -ForegroundColor White
    Write-Host "   - Click 'Run' (or press Ctrl+Enter)" -ForegroundColor White
    Write-Host "   - Wait for 'Success' message" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ After migration completes, run: npm run dev" -ForegroundColor Green
} else {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

