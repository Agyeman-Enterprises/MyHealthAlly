# Find Multiple Available Ports
# Usage: .\find-ports.ps1 [count] [startPort]
# Example: .\find-ports.ps1 2 3000  (finds 2 ports starting from 3000)

param(
    [int]$Count = 2,
    [int]$StartPort = 3000
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

Write-Host "Finding $Count available port(s) starting from $StartPort..." -ForegroundColor Cyan
Write-Host ""

$foundPorts = @()
$currentPort = $StartPort
$maxAttempts = 1000

while ($foundPorts.Count -lt $Count -and $currentPort -lt ($StartPort + $maxAttempts)) {
    if (Test-Port -Port $currentPort) {
        $foundPorts += $currentPort
        Write-Host "Port $currentPort is available" -ForegroundColor Green
    }
    $currentPort++
}

if ($foundPorts.Count -eq $Count) {
    Write-Host ""
    Write-Host "Found $Count available port(s):" -ForegroundColor Green
    for ($i = 0; $i -lt $foundPorts.Count; $i++) {
        $portNum = $i + 1
        Write-Host "  Port $portNum : $($foundPorts[$i])" -ForegroundColor Cyan
    }
    
    # Export as environment variables
    for ($i = 0; $i -lt $foundPorts.Count; $i++) {
        $envVarName = "PORT" + ($i + 1)
        Set-Item -Path "env:$envVarName" -Value $foundPorts[$i]
    }
    
    return $foundPorts
} else {
    Write-Host ""
    $foundCount = $foundPorts.Count
    Write-Host "Only found $foundCount of $Count ports" -ForegroundColor Red
    return $foundPorts
}
