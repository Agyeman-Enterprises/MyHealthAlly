# Copy Supabase env vars from root .env to pwa/.env.local and .env.production
# This script reads the root .env and creates pwa/.env.local and .env.production with Next.js format

param(
    [switch]$Production = $false
)

if ($Production) {
    $targetFile = ".env.production"
    Write-Host "📋 Copying Supabase env vars to pwa/.env.production" -ForegroundColor Cyan
} else {
    $targetFile = ".env.local"
    Write-Host "📋 Copying Supabase env vars to pwa/.env.local" -ForegroundColor Cyan
}
Write-Host ""

$rootEnv = Join-Path $PSScriptRoot "..\.env"
$pwaEnv = Join-Path $PSScriptRoot $targetFile

if (-not (Test-Path $rootEnv)) {
    Write-Host "❌ Root .env file not found at: $rootEnv" -ForegroundColor Red
    exit 1
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

# Create pwa/.env.local with Next.js format
$pwaEnvContent = @"
# Supabase Configuration
# Copied from root .env
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey

# Service role key (server-side only, not exposed to client)
SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey

# SoloPractice API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
"@

$pwaEnvContent | Out-File -FilePath $pwaEnv -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Created pwa/$targetFile" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Values:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$($supabaseAnonKey.Substring(0, [Math]::Min(20, $supabaseAnonKey.Length)))..." -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next: Restart dev server (npm run dev)" -ForegroundColor Cyan

