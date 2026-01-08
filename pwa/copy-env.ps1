# Copy Supabase env vars from root .env to pwa/.env.local and .env.production
# This script MERGES Supabase vars into existing .env.local (preserves other vars)
# Creates backup before modifying

param(
    [switch]$Production = $false
)

if ($Production) {
    $targetFile = ".env.production"
    Write-Host "📋 Merging Supabase env vars into pwa/.env.production" -ForegroundColor Cyan
} else {
    $targetFile = ".env.local"
    Write-Host "📋 Merging Supabase env vars into pwa/.env.local" -ForegroundColor Cyan
}
Write-Host ""

$rootEnv = Join-Path $PSScriptRoot "..\.env"
$pwaEnv = Join-Path $PSScriptRoot $targetFile

if (-not (Test-Path $rootEnv)) {
    Write-Host "❌ Root .env file not found at: $rootEnv" -ForegroundColor Red
    exit 1
}

# Create backup if file exists
if (Test-Path $pwaEnv) {
    $backupFile = "$pwaEnv.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $pwaEnv $backupFile
    Write-Host "💾 Created backup: $backupFile" -ForegroundColor Yellow
}

Write-Host "📖 Reading root .env file..." -ForegroundColor Yellow
$envContent = Get-Content $rootEnv

# Extract Supabase values (handle both formats)
$supabaseUrl = ""
$supabaseAnonKey = ""
$supabaseServiceKey = ""

foreach ($line in $envContent) {
    # Skip comments and empty lines
    if ($line -match "^\s*#" -or $line -match "^\s*$") { continue }
    
    # Try NEXT_PUBLIC_ format first (Next.js)
    if ($line -match "^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)") {
        $supabaseUrl = $matches[1].Trim()
    }
    elseif ($line -match "^NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)") {
        $supabaseAnonKey = $matches[1].Trim()
    }
    # Fallback to non-prefixed format
    elseif ($line -match "^SUPABASE_URL\s*=\s*(.+)") {
        $supabaseUrl = $matches[1].Trim()
    }
    elseif ($line -match "^SUPABASE_ANON_KEY\s*=\s*(.+)") {
        $supabaseAnonKey = $matches[1].Trim()
    }
    elseif ($line -match "^SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)") {
        $supabaseServiceKey = $matches[1].Trim()
    }
}

if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    Write-Host "⚠️  SUPABASE_URL not found in root .env" -ForegroundColor Yellow
    Write-Host "   Please add it to root .env file" -ForegroundColor Gray
}

if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    Write-Host "⚠️  SUPABASE_ANON_KEY not found in root .env" -ForegroundColor Yellow
    Write-Host "   Please add it to root .env file" -ForegroundColor Gray
}

# Read existing .env.local if it exists, otherwise start fresh
$existingVars = @{}
if (Test-Path $pwaEnv) {
    Write-Host "📖 Reading existing $targetFile..." -ForegroundColor Yellow
    $existingLines = Get-Content $pwaEnv
    foreach ($line in $existingLines) {
        # Skip comments and empty lines
        if ($line -match "^\s*#" -or $line -match "^\s*$") { continue }
        # Parse KEY=VALUE format
        if ($line -match "^([^=]+)\s*=\s*(.+)") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $existingVars[$key] = $value
        }
    }
    Write-Host "   Found $($existingVars.Count) existing variables" -ForegroundColor Gray
}

# Update/Add Supabase vars (preserve all other vars)
if (-not [string]::IsNullOrWhiteSpace($supabaseUrl)) {
    $existingVars["NEXT_PUBLIC_SUPABASE_URL"] = $supabaseUrl
}
if (-not [string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    $existingVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = $supabaseAnonKey
}
if (-not [string]::IsNullOrWhiteSpace($supabaseServiceKey)) {
    $existingVars["SUPABASE_SERVICE_ROLE_KEY"] = $supabaseServiceKey
}

# Only add API_BASE_URL if it doesn't exist
if (-not $existingVars.ContainsKey("NEXT_PUBLIC_API_BASE_URL")) {
    $existingVars["NEXT_PUBLIC_API_BASE_URL"] = "http://localhost:3000"
}

# Write merged content
$outputLines = @()
$outputLines += "# Environment Variables"
$outputLines += "# Supabase vars merged from root .env on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$outputLines += ""

# Group Supabase vars together
$supabaseKeys = @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY")
$otherKeys = $existingVars.Keys | Where-Object { $supabaseKeys -notcontains $_ }

# Write Supabase vars first
$outputLines += "# Supabase Configuration"
foreach ($key in $supabaseKeys) {
    if ($existingVars.ContainsKey($key)) {
        $outputLines += "$key=$($existingVars[$key])"
    }
}
$outputLines += ""

# Write other vars
if ($otherKeys.Count -gt 0) {
    $outputLines += "# Other Configuration"
    foreach ($key in $otherKeys | Sort-Object) {
        $outputLines += "$key=$($existingVars[$key])"
    }
}

$outputLines | Out-File -FilePath $pwaEnv -Encoding utf8

Write-Host ""
Write-Host "✅ Updated pwa/$targetFile (merged, preserved existing vars)" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Values:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$($supabaseAnonKey.Substring(0, [Math]::Min(20, $supabaseAnonKey.Length)))..." -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next: Restart dev server (npm run dev)" -ForegroundColor Cyan

