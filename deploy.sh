#!/bin/bash

# MyHealthAlly Web App - Deployment Script
# This script prepares the project for deployment

set -e

echo "🚀 MyHealthAlly Web App - Deployment Preparation"
echo "================================================"

# Step 1: Verify git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository found"
fi

# Step 2: Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Consider committing them before deploying:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 3: Run production build
echo ""
echo "📦 Running production build..."
cd packages/web
pnpm install
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Production build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

cd ../..

# Step 4: Verify environment variables
echo ""
echo "🔍 Checking environment variables..."
if [ ! -f "packages/web/.env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Make sure to set environment variables in Vercel:"
    echo "   - NEXT_PUBLIC_API_URL"
    echo "   - NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY"
fi

# Step 5: Summary
echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository: myhealthally-web"
echo "2. Push code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/myhealthally-web.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "3. Import repository in Vercel"
echo "4. Configure environment variables in Vercel"
echo "5. Deploy!"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."

