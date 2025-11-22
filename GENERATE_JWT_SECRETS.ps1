# Generate JWT Secrets for MyHealthAlly
# Run this script to generate secure JWT secrets

Write-Host "Generating JWT secrets for MyHealthAlly..." -ForegroundColor Green
Write-Host ""

# Generate JWT_SECRET
$jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "JWT_SECRET:" -ForegroundColor Cyan
Write-Host $jwtSecret -ForegroundColor Yellow
Write-Host ""

# Generate JWT_REFRESH_SECRET
$refreshSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "JWT_REFRESH_SECRET:" -ForegroundColor Cyan
Write-Host $refreshSecret -ForegroundColor Yellow
Write-Host ""

Write-Host "Copy these values and update packages\backend\.env:" -ForegroundColor Green
Write-Host "1. Replace JWT_SECRET value" -ForegroundColor White
Write-Host "2. Replace JWT_REFRESH_SECRET value" -ForegroundColor White
Write-Host ""

# Optionally update .env file automatically
$update = Read-Host "Would you like to update packages\backend\.env automatically? (y/n)"

if ($update -eq "y" -or $update -eq "Y") {
    $envPath = "packages\backend\.env"
    if (Test-Path $envPath) {
        $content = Get-Content $envPath
        $updated = $content | ForEach-Object {
            if ($_ -match "^JWT_SECRET=") {
                "JWT_SECRET=" + '"' + $jwtSecret + '"'
            } elseif ($_ -match "^JWT_REFRESH_SECRET=") {
                "JWT_REFRESH_SECRET=" + '"' + $refreshSecret + '"'
            } else {
                $_
            }
        }
        $updated | Set-Content $envPath -Encoding UTF8
        Write-Host ""
        Write-Host "Updated packages\backend\.env with generated secrets!" -ForegroundColor Green
    } else {
        Write-Host "Error: packages\backend\.env not found!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "Manual update required. Edit packages\backend\.env and replace:" -ForegroundColor Yellow
    Write-Host "  JWT_SECRET=" -NoNewline -ForegroundColor White
    Write-Host $jwtSecret -ForegroundColor Yellow
    Write-Host "  JWT_REFRESH_SECRET=" -NoNewline -ForegroundColor White
    Write-Host $refreshSecret -ForegroundColor Yellow
}
