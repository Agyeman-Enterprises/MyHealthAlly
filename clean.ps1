# MyHealth Ally PWA - Clean Build Cache Script
# Run this from the root directory: .\clean.ps1

Write-Host "Cleaning PWA build cache..." -ForegroundColor Yellow

# Navigate to pwa directory
Set-Location -Path "pwa"

# Stop any running dev servers (if possible)
Write-Host "Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*pwa*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for files to unlock
Start-Sleep -Seconds 2

# Remove .next directory if it exists
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✓ Build cache cleaned successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not fully remove .next directory. Some files may be locked." -ForegroundColor Red
        Write-Host "  Try closing any running dev servers and try again." -ForegroundColor Yellow
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "✓ No .next directory found. Already clean!" -ForegroundColor Green
}

# Return to root
Set-Location -Path ".."

Write-Host "`nDone! You can now run: .\dev.ps1" -ForegroundColor Cyan
