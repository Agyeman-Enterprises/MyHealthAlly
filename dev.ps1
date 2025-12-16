# MyHealth Ally PWA - Dev Server Script
# Run this from the root directory: .\dev.ps1

Write-Host "Starting MyHealth Ally PWA dev server..." -ForegroundColor Cyan

# Navigate to pwa directory
Set-Location -Path "pwa"

# Run dev server
npm run dev
