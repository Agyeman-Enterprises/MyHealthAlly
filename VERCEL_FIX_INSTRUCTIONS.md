# Vercel Deployment Fix Instructions

## ⚠️ Critical: Set Root Directory in Vercel Dashboard

The deployment is failing because Vercel needs to know the root directory for the Next.js app in the monorepo.

### Steps to Fix:

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/coda-projects/myhealthally-web/settings
   - Or: https://vercel.com/coda-projects/web/settings

2. **Set Root Directory**:
   - Click on **General** tab
   - Scroll to **Root Directory**
   - Click **Edit**
   - Enter: `packages/web`
   - Click **Save**

3. **Set Environment Variables** (if not already set):
   - Go to **Settings** → **Environment Variables**
   - Add these for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_API_BASE_URL=https://api.myhealthally.com
NEXT_PUBLIC_API_URL=https://api.myhealthally.com
NEXT_PUBLIC_CONTENT_URL=https://content.myhealthally.com
NEXT_PUBLIC_VIDEO_BASE_URL=https://video.myhealthally.com
NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY=27c0a1050b53444993b6c4968fdc6bd1
```

**Note**: This app uses custom JWT authentication (not Auth0/Azure AD), so `AUTH_CLIENT_ID` and `AUTH_TENANT` are not needed.

4. **Redeploy**:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deployment

## Alternative: Deploy from packages/web directory

If setting Root Directory doesn't work, you can also:

1. Delete the root `vercel.json`
2. Deploy from `packages/web` directory:
   ```bash
   cd packages/web
   vercel --prod --yes
   ```

## Current Configuration

- **Root vercel.json**: Configured for monorepo build
- **Build Command**: `pnpm install && pnpm --filter @myhealthally/web build`
- **Output Directory**: `packages/web/.next`
- **Install Command**: `pnpm install`

The build command will:
1. Install all dependencies from monorepo root
2. Build only the `@myhealthally/web` package
3. Output to `packages/web/.next`

---

**After setting Root Directory, the deployment should succeed!**

