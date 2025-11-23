# MyHealthAlly Web App - Production Deployment Guide

## 🚀 Quick Start

This guide will walk you through deploying the MyHealthAlly web app to production using Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Node.js 18.x installed locally (for testing builds)

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MyHealthAlly web app"

# Create repository on GitHub (requires GitHub CLI)
gh repo create myhealthally-web --public --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `myhealthally-web`
3. Choose Public or Private
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"
6. Follow the instructions to push existing code:

```bash
git init
git add .
git commit -m "Initial commit: MyHealthAlly web app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/myhealthally-web.git
git push -u origin main
```

## Step 2: Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `myhealthally-web` from your GitHub repositories
4. Click "Import"

## Step 3: Configure Vercel Project Settings

### Framework Preset
- **Framework Preset**: Next.js (auto-detected)

### Root Directory
- **Root Directory**: `packages/web`

### Build Settings
- **Build Command**: `pnpm install && pnpm --filter @myhealthally/web build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install`
- **Node Version**: 18.x

### Environment Variables

Add the following environment variables in Vercel:

1. **NEXT_PUBLIC_API_URL**
   - Production: `https://api.myhealthally.com`
   - Preview: `https://api-staging.myhealthally.com` (or your staging API URL)
   - Development: `http://localhost:3000`

2. **NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY**
   - Value: `27c0a1050b53444993b6c4968fdc6bd1` (or your Builder.io API key)

3. **NODE_ENV**
   - Production: `production`
   - Preview: `production`
   - Development: `development`

### Deployment Settings
- **Production Branch**: `main`
- **Automatic Deployments**: Enabled
- **Serverless Functions**: Enabled (default for Next.js)

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll receive:
   - **Production URL**: `https://myhealthally-web.vercel.app` (or your custom domain)
   - **Preview URL**: `https://myhealthally-web-git-branch-username.vercel.app`

## Step 5: Verify Deployment

### Automated QA Checklist

After deployment, verify the following:

#### Design / Styling
- [ ] Teal brand color `#39C6B3` applied across all components
- [ ] Cards, buttons, inputs, tabs match 6px radius + typography scale
- [ ] Shadows match theme.json
- [ ] Responsive design works on mobile

#### Patient App Routes
- [ ] `/patient/dashboard` loads
- [ ] `/patient/analytics` - Analytics/BMI graph loads
- [ ] `/patient/labs` - Orders + Results tabs load
- [ ] `/patient/profile` - Referrals + Documents tabs load
- [ ] `/patient/messages` - Messages + AI thread load
- [ ] `/patient/schedule` loads

#### Clinician Portal Routes
- [ ] `/clinician/dashboard` loads
- [ ] `/clinician/patients` loads
- [ ] `/clinician/patients/[patientId]` loads
- [ ] `/clinician/visit/[visitId]` loads
- [ ] `/clinician/tasks` loads
- [ ] `/clinician/messages` loads
- [ ] `/clinician/labs` loads

#### Ohimaa Content Engine Routes
- [ ] `/content/programs` loads
- [ ] `/content/meal-plans` loads
- [ ] `/content/exercises` loads
- [ ] `/content/stress` loads
- [ ] `/content/sleep` loads
- [ ] `/content/gi-reset` loads
- [ ] `/content/detox` loads
- [ ] `/content/support` loads

#### Technical Checks
- [ ] No missing assets (images, fonts, etc.)
- [ ] No routing errors (404s)
- [ ] No console errors (check browser DevTools)
- [ ] API calls work (check Network tab)
- [ ] Authentication flow works

## Step 6: Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `app.myhealthally.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually 24-48 hours)

## Troubleshooting

### Build Fails

**Error: Module not found**
- Ensure all dependencies are in `package.json`
- Run `pnpm install` locally to verify

**Error: TypeScript errors**
- Fix all TypeScript errors before deploying
- Run `pnpm --filter @myhealthally/web build` locally

**Error: Environment variables missing**
- Verify all required env vars are set in Vercel
- Check variable names match exactly (case-sensitive)

### Runtime Errors

**Error: API calls failing**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend API
- Verify API is accessible from Vercel's IPs

**Error: Builder.io not loading**
- Verify `NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY` is set
- Check Builder.io dashboard for API key status

### Performance Issues

- Enable Vercel Analytics to monitor performance
- Use Vercel's Image Optimization for images
- Check bundle size with `pnpm --filter @myhealthally/web build --analyze`

## Local Production Build Test

Before deploying, test the production build locally:

```bash
# Install dependencies
pnpm install

# Build for production
pnpm --filter @myhealthally/web build

# Start production server
pnpm --filter @myhealthally/web start
```

Visit `http://localhost:3000` to verify everything works.

## Continuous Deployment

Once connected to Vercel:
- Every push to `main` branch = Production deployment
- Every pull request = Preview deployment
- Automatic rollback on deployment failure

## Support

For issues or questions:
- Check Vercel logs: Project → Deployments → Click deployment → View logs
- Check build logs for compilation errors
- Verify environment variables are set correctly

---

**Deployment Status**: Ready for production deployment
**Last Updated**: 2024-01-XX
**Version**: 1.0.0

