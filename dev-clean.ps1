# MyHealth Ally PWA - Clean and Start Dev Server
# Run this from the root directory: .\dev-clean.ps1

Write-Host "Cleaning and starting MyHealth Ally PWA dev server..." -ForegroundColor Cyan

# Navigate to pwa directory
Set-Location -Path "pwa"

# Stop any running dev servers
Write-Host "Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*pwa*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for files to unlock
Start-Sleep -Seconds 2

# Remove .next directory if it exists
if (Test-Path ".next") {
    Write-Host "Cleaning build cache..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✓ Build cache cleaned!" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not fully remove .next directory. Some files may be locked." -ForegroundColor Red
        Write-Host "  Continuing anyway..." -ForegroundColor Yellow
    }
}

# Run dev server
Write-Host "`nStarting dev server..." -ForegroundColor Cyan
npm run dev
