# Test Runner that attempts to work around kapt issues
# This script tries multiple approaches to run tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MyHealthAlly Test Runner (kapt workaround)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Method 1: Try to compile and run tests directly
Write-Host "Attempting Method 1: Direct test compilation..." -ForegroundColor Yellow
try {
    & .\gradlew.bat :app:compileDebugUnitTestKotlin --no-daemon 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Test compilation successful!" -ForegroundColor Green
        Write-Host "Running tests..." -ForegroundColor Yellow
        & .\gradlew.bat :app:testDebugUnitTest --no-daemon --rerun-tasks
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Tests executed successfully!" -ForegroundColor Green
            exit 0
        }
    }
} catch {
    Write-Host "Method 1 failed: $_" -ForegroundColor Red
}

# Method 2: Try with --no-build-cache
Write-Host ""
Write-Host "Attempting Method 2: Without build cache..." -ForegroundColor Yellow
try {
    & .\gradlew.bat :app:testDebugUnitTest --no-build-cache --no-daemon --rerun-tasks 2>&1 | Select-Object -Last 30
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Tests executed successfully!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "Method 2 failed: $_" -ForegroundColor Red
}

# Method 3: Clean and rebuild
Write-Host ""
Write-Host "Attempting Method 3: Clean build..." -ForegroundColor Yellow
try {
    & .\gradlew.bat clean :app:testDebugUnitTest --no-daemon 2>&1 | Select-Object -Last 30
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Tests executed successfully!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "Method 3 failed: $_" -ForegroundColor Red
}

# Method 4: Try Android Studio approach
Write-Host ""
Write-Host "All automated methods failed." -ForegroundColor Red
Write-Host ""
Write-Host "Alternative: Run tests from Android Studio" -ForegroundColor Yellow
Write-Host "1. Open project in Android Studio" -ForegroundColor White
Write-Host "2. Right-click on app/src/test" -ForegroundColor White
Write-Host "3. Select 'Run Tests in app'" -ForegroundColor White
Write-Host ""
Write-Host "Or use IntelliJ IDEA test runner:" -ForegroundColor Yellow
Write-Host "1. Open any test file" -ForegroundColor White
Write-Host "2. Click the green play button next to the test class/method" -ForegroundColor White
Write-Host ""

exit 1

