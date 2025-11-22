# PowerShell script to set up environment files
# Run this from the project root: .\SETUP_ENV.ps1

Write-Host "Setting up MyHealthAlly environment files..." -ForegroundColor Green

# Backend .env
if (-not (Test-Path "packages\backend\.env")) {
    Copy-Item "packages\backend\.env.example" "packages\backend\.env"
    Write-Host "Created packages\backend\.env" -ForegroundColor Green
    Write-Host "  Please edit packages\backend\.env and set:" -ForegroundColor Yellow
    Write-Host "     - DATABASE_URL" -ForegroundColor Yellow
    Write-Host "     - JWT_SECRET (generate with: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })))" -ForegroundColor Yellow
    Write-Host "     - JWT_REFRESH_SECRET" -ForegroundColor Yellow
} else {
    Write-Host "packages\backend\.env already exists, skipping" -ForegroundColor Yellow
}

# Web .env.local
if (-not (Test-Path "packages\web\.env.local")) {
    Copy-Item "packages\web\.env.example" "packages\web\.env.local"
    Write-Host "Created packages\web\.env.local" -ForegroundColor Green
    Write-Host "  Please edit packages\web\.env.local and set:" -ForegroundColor Yellow
    Write-Host "     - NEXT_PUBLIC_API_URL" -ForegroundColor Yellow
} else {
    Write-Host "packages\web\.env.local already exists, skipping" -ForegroundColor Yellow
}

# Root .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env" -ForegroundColor Green
} else {
    Write-Host ".env already exists, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Environment setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit packages\backend\.env with your database and JWT secrets" -ForegroundColor White
Write-Host "2. Edit packages\web\.env.local with your backend URL" -ForegroundColor White
Write-Host "3. Update API URLs in iOS/Android code if needed" -ForegroundColor White
Write-Host ""
Write-Host "See ENV_SETUP.md for detailed instructions." -ForegroundColor Cyan

