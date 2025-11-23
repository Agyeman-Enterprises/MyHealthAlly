# MyHealthAlly Development Server Startup Script
# Starts backend, waits for it to be ready, then starts frontend

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting MyHealthAlly Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Colors
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"
$warningColor = "Yellow"

# Configuration
$backendPort = 3000
$frontendPort = 3001
$backendUrl = "http://localhost:$backendPort"
$healthEndpoint = "$backendUrl/health"
$maxWaitTime = 60 # seconds
$checkInterval = 2 # seconds

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

# Function to check backend health
function Test-BackendHealth {
    try {
        $response = Invoke-WebRequest -Uri $healthEndpoint -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to wait for backend
function Wait-ForBackend {
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor $infoColor
    $elapsed = 0
    
    while ($elapsed -lt $maxWaitTime) {
        if (Test-BackendHealth) {
            Write-Host "✅ Backend is ready!" -ForegroundColor $successColor
            return $true
        }
        
        Start-Sleep -Seconds $checkInterval
        $elapsed += $checkInterval
        Write-Host "   Checking... (${elapsed}s)" -ForegroundColor Gray
    }
    
    Write-Host "❌ Backend failed to start within $maxWaitTime seconds" -ForegroundColor $errorColor
    return $false
}

# Cleanup function
function Stop-Servers {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor $warningColor
    
    Get-Process | Where-Object {
        $_.ProcessName -eq "node" -and 
        ($_.CommandLine -like "*packages\backend*" -or $_.CommandLine -like "*packages\web*")
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Kill processes on specific ports
    $backendProcess = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    $frontendProcess = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($backendProcess) {
        Stop-Process -Id $backendProcess -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess) {
        Stop-Process -Id $frontendProcess -Force -ErrorAction SilentlyContinue
    }
}

# Register cleanup on script exit
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-Servers } | Out-Null

# Check if ports are already in use
if (Test-Port -Port $backendPort) {
    Write-Host "⚠️  Port $backendPort is already in use" -ForegroundColor $warningColor
    $response = Read-Host "Kill existing process and continue? (y/n)"
    if ($response -eq "y") {
        $process = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    } else {
        Write-Host "Exiting..." -ForegroundColor $infoColor
        exit 1
    }
}

if (Test-Port -Port $frontendPort) {
    Write-Host "⚠️  Port $frontendPort is already in use" -ForegroundColor $warningColor
    $response = Read-Host "Kill existing process and continue? (y/n)"
    if ($response -eq "y") {
        $process = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    } else {
        Write-Host "Exiting..." -ForegroundColor $infoColor
        exit 1
    }
}

# Start backend
Write-Host "📦 Starting backend server..." -ForegroundColor $infoColor
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location packages\backend
    pnpm dev 2>&1
}

# Wait for backend to be ready
if (-not (Wait-ForBackend)) {
    Write-Host "❌ Failed to start backend. Check logs above." -ForegroundColor $errorColor
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}

# Start frontend
Write-Host ""
Write-Host "🌐 Starting frontend server..." -ForegroundColor $infoColor
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location packages\web
    pnpm dev 2>&1
}

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

# Check if frontend started
if (Test-Port -Port $frontendPort) {
    Write-Host "✅ Frontend is ready!" -ForegroundColor $successColor
} else {
    Write-Host "⚠️  Frontend may still be starting..." -ForegroundColor $warningColor
}

# Display status
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎉 Development servers are running!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend API:  $backendUrl" -ForegroundColor White
Write-Host "  Frontend:     http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  Health Check: $healthEndpoint" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host ""

# Monitor jobs and display output
try {
    while ($true) {
        $backendOutput = Receive-Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job $frontendJob -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[Backend] $backendOutput" -ForegroundColor Magenta
        }
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Blue
        }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Shutting down..." -ForegroundColor $warningColor
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Stop-Servers
}

