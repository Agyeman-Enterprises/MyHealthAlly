# MyHealthAlly Test Runner Script
# This script provides multiple ways to run tests

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "unit", "compile", "gradle", "help")]
    [string]$Mode = "help"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MyHealthAlly Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Show-Help {
    Write-Host "Usage: .\run-tests.ps1 -Mode <mode>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Modes:" -ForegroundColor Yellow
    Write-Host "  all     - Run all unit tests via Gradle" -ForegroundColor White
    Write-Host "  unit    - Run unit tests only" -ForegroundColor White
    Write-Host "  compile - Compile test classes only (no execution)" -ForegroundColor White
    Write-Host "  gradle  - Use Gradle wrapper directly" -ForegroundColor White
    Write-Host "  help    - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\run-tests.ps1 -Mode all" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 -Mode unit" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 -Mode compile" -ForegroundColor Gray
}

function Run-UnitTests {
    Write-Host "Running unit tests..." -ForegroundColor Green
    Write-Host ""
    
    try {
        & .\gradlew.bat :app:testDebugUnitTest --continue
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Tests completed successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "✗ Some tests failed. Check output above." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "Error running tests: $_" -ForegroundColor Red
        exit 1
    }
}

function Compile-TestClasses {
    Write-Host "Compiling test classes..." -ForegroundColor Green
    Write-Host ""
    
    try {
        & .\gradlew.bat :app:compileDebugUnitTestKotlin --continue
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Test classes compiled successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "✗ Compilation failed. Check output above." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "Error compiling tests: $_" -ForegroundColor Red
        exit 1
    }
}

function Run-AllTests {
    Write-Host "Running all tests..." -ForegroundColor Green
    Write-Host ""
    
    try {
        & .\gradlew.bat :app:test --continue
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ All tests completed successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "✗ Some tests failed. Check output above." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "Error running tests: $_" -ForegroundColor Red
        exit 1
    }
}

function Show-GradleTasks {
    Write-Host "Available Gradle test tasks:" -ForegroundColor Green
    Write-Host ""
    & .\gradlew.bat :app:tasks --all | Select-String -Pattern "test" | Select-Object -First 20
}

# Main execution
switch ($Mode) {
    "all" {
        Run-AllTests
    }
    "unit" {
        Run-UnitTests
    }
    "compile" {
        Compile-TestClasses
    }
    "gradle" {
        Show-GradleTasks
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}

