# Auto-Run Migrations Helper
# Opens Supabase Dashboard and migration files for easy copy-paste

Write-Host "🚀 AUTO-RUNNING MIGRATIONS" -ForegroundColor Cyan
Write-Host ""

$migrationsDir = Join-Path $PSScriptRoot "..\supabase\migrations"
$migrations = @(
    "001_initial_schema.sql",
    "003_missing_tables.sql", 
    "002_test_data.sql"
)

# Open Supabase Dashboard
Write-Host "🌐 Opening Supabase Dashboard..." -ForegroundColor Yellow
Start-Process "https://app.supabase.com/project/azajmuydsvoegbpgmwpe/sql/new"

Start-Sleep -Seconds 2

# Open all migration files
Write-Host "📄 Opening migration files..." -ForegroundColor Yellow
foreach ($migration in $migrations) {
    $path = Join-Path $migrationsDir $migration
    if (Test-Path $path) {
        Write-Host "   Opening: $migration" -ForegroundColor Gray
        Start-Process notepad.exe $path
        Start-Sleep -Milliseconds 500
    }
}

Write-Host ""
Write-Host "✅ All files opened!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 QUICK STEPS:" -ForegroundColor Cyan
Write-Host "   1. In Supabase Dashboard (SQL Editor):" -ForegroundColor White
Write-Host "   2. Copy ALL from 001_initial_schema.sql (Ctrl+A, Ctrl+C)" -ForegroundColor White
Write-Host "   3. Paste into SQL Editor, click Run" -ForegroundColor White
Write-Host "   4. Repeat for 003_missing_tables.sql" -ForegroundColor White
Write-Host "   5. Repeat for 002_test_data.sql (optional)" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  This takes ~2 minutes total" -ForegroundColor Yellow

