# MyHealthAlly - Start All Services
# This script starts backend and web servers in separate windows

Write-Host "Starting MyHealthAlly services..." -ForegroundColor Green
Write-Host ""

# Check if pnpm is installed
$pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpmCheck) {
    Write-Host "pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check if dependencies are installed
if (-not (Test-Path "packages\backend\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
Set-Location packages\backend
pnpm prisma generate
Set-Location ..\..

# Start backend in new window
Write-Host "Starting backend server (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\backend'; Write-Host 'Backend Server - Port 3000' -ForegroundColor Green; pnpm dev"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start web in new window
Write-Host "Starting web dashboard (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\web'; Write-Host 'Web Dashboard - Port 3001' -ForegroundColor Green; pnpm dev"

Write-Host ""
Write-Host "Services starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Web:     http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check health: http://localhost:3000/health" -ForegroundColor Yellow

