# Port Finder Script - Finds an available port
# Usage: .\find-port.ps1 [startPort] [maxPort]
# Example: .\find-port.ps1 3000 3100

param(
    [int]$StartPort = 3000,
    [int]$MaxPort = 3100
)

function Test-Port {
    param([int]$Port)
    
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

Write-Host "Finding available port starting from $StartPort..." -ForegroundColor Cyan

for ($port = $StartPort; $port -le $MaxPort; $port++) {
    if (Test-Port -Port $port) {
        Write-Host "Found available port: $port" -ForegroundColor Green
        return $port
    }
    Write-Host "  Port $port is in use, trying next..." -ForegroundColor Yellow
}

Write-Host "No available ports found in range $StartPort to $MaxPort" -ForegroundColor Red
return $null
