# PowerShell script to help run migrations
# Opens each migration file for easy copy-paste into Supabase Dashboard

Write-Host "🚀 MyHealthAlly - Migration Runner Helper" -ForegroundColor Cyan
Write-Host ""

$migrationsDir = Join-Path $PSScriptRoot "..\supabase\migrations"
$migrations = @(
    @{ File = "001_initial_schema.sql"; Name = "Core Schema"; Required = $true },
    @{ File = "003_missing_tables.sql"; Name = "Missing Tables"; Required = $true },
    @{ File = "002_test_data.sql"; Name = "Test Data"; Required = $false }
)

Write-Host "📋 Migration Files:" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    $path = Join-Path $migrationsDir $migration.File
    if (Test-Path $path) {
        $lines = (Get-Content $path | Measure-Object -Line).Lines
        $required = if ($migration.Required) { "REQUIRED" } else { "OPTIONAL" }
        Write-Host "   ✅ $($migration.File) - $($migration.Name) ($lines lines) [$required]" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($migration.File) - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: Supabase doesn't allow automated SQL execution" -ForegroundColor Yellow
Write-Host "   You must run these manually in Supabase Dashboard" -ForegroundColor Yellow
Write-Host ""

$run = Read-Host "Open Supabase Dashboard and run migrations? (y/N)"
if ($run -eq "y" -or $run -eq "Y") {
    Write-Host ""
    Write-Host "🌐 Opening Supabase Dashboard..." -ForegroundColor Cyan
    Start-Process "https://app.supabase.com"
    
    Write-Host ""
    Write-Host "📝 Instructions:" -ForegroundColor Yellow
    Write-Host "   1. Select your project" -ForegroundColor White
    Write-Host "   2. Go to: SQL Editor → New Query" -ForegroundColor White
    Write-Host "   3. I'll open each migration file for you to copy" -ForegroundColor White
    Write-Host ""
    
    Start-Sleep -Seconds 3
    
    foreach ($migration in $migrations) {
        $path = Join-Path $migrationsDir $migration.File
        if (Test-Path $path) {
            Write-Host "📄 Opening: $($migration.File)" -ForegroundColor Cyan
            Write-Host "   → Copy ALL contents (Ctrl+A, Ctrl+C)" -ForegroundColor Gray
            Write-Host "   → Paste into Supabase SQL Editor" -ForegroundColor Gray
            Write-Host "   → Click Run" -ForegroundColor Gray
            Write-Host ""
            
            Start-Process notepad.exe $path
            
            $continue = Read-Host "Press Enter after you've run this migration (or 'q' to quit)"
            if ($continue -eq "q") {
                Write-Host "Stopped." -ForegroundColor Gray
                break
            }
        }
    }
    
    Write-Host ""
    Write-Host "✅ Migration process complete!" -ForegroundColor Green
    Write-Host "   Next: Test your app at http://localhost:3000/provider/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "Cancelled." -ForegroundColor Gray
}

