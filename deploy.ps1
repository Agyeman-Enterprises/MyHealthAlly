# MyHealthAlly Web App - Deployment Script (PowerShell)
# This script prepares the project for deployment

Write-Host "🚀 MyHealthAlly Web App - Deployment Preparation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Verify git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git not initialized. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository found" -ForegroundColor Green
}

# Step 2: Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes" -ForegroundColor Yellow
    Write-Host "   Consider committing them before deploying:"
    Write-Host "   git add ."
    Write-Host "   git commit -m 'Prepare for deployment'"
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

# Step 3: Run production build
Write-Host ""
Write-Host "📦 Running production build..." -ForegroundColor Cyan
Set-Location packages\web
pnpm install
pnpm build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

Set-Location ..\..

# Step 4: Verify environment variables
Write-Host ""
Write-Host "🔍 Checking environment variables..." -ForegroundColor Cyan
if (-not (Test-Path "packages\web\.env.local")) {
    Write-Host "⚠️  Warning: .env.local not found" -ForegroundColor Yellow
    Write-Host "   Make sure to set environment variables in Vercel:"
    Write-Host "   - NEXT_PUBLIC_API_URL"
    Write-Host "   - NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY"
}

# Step 5: Summary
Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Create GitHub repository: myhealthally-web"
Write-Host "2. Push code to GitHub:"
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/myhealthally-web.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host "3. Import repository in Vercel"
Write-Host "4. Configure environment variables in Vercel"
Write-Host "5. Deploy!"
Write-Host ""
Write-Host "See DEPLOYMENT_GUIDE.md for detailed instructions." -ForegroundColor Cyan

