# Script to update .env file with Supabase connection string
# Usage: .\UPDATE_SUPABASE.ps1

Write-Host "Updating backend .env to use Supabase..." -ForegroundColor Green
Write-Host ""
Write-Host "To get your Supabase connection string:" -ForegroundColor Cyan
Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to: Settings → Database" -ForegroundColor White
Write-Host "4. Copy the connection string (URI format)" -ForegroundColor White
Write-Host ""

$connectionString = Read-Host "Paste your Supabase connection string here"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "No connection string provided. Exiting." -ForegroundColor Red
    exit
}

# Add pgbouncer=true if not present and using port 6543
if ($connectionString -match ":6543" -and $connectionString -notmatch "pgbouncer=true") {
    if ($connectionString -match "\?") {
        $connectionString = $connectionString + "&pgbouncer=true"
    } else {
        $connectionString = $connectionString + "?pgbouncer=true"
    }
    Write-Host "Added ?pgbouncer=true for connection pooling" -ForegroundColor Yellow
}

# Read current .env file
$envPath = "packages\backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "Error: packages\backend\.env not found!" -ForegroundColor Red
    exit
}

$envContent = Get-Content $envPath

# Replace DATABASE_URL line
$updatedContent = $envContent | ForEach-Object {
    if ($_ -match "^DATABASE_URL=") {
        "DATABASE_URL=`"$connectionString`""
    } else {
        $_
    }
}

# Write updated content
$updatedContent | Set-Content $envPath -Encoding UTF8

Write-Host ""
Write-Host "✓ Updated packages\backend\.env with Supabase connection string" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd packages/backend" -ForegroundColor White
Write-Host "2. pnpm prisma generate" -ForegroundColor White
Write-Host "3. pnpm prisma migrate dev" -ForegroundColor White
Write-Host ""
Write-Host "You can now stop Docker if not needed: docker-compose down" -ForegroundColor Yellow

