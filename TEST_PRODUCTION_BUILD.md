# Testing Production Build Locally

## Quick Test

To test the production build locally before deploying:

### Step 1: Build for Production

```bash
cd C:\Users\Admin\Dropbox\A-Computer\HealthAlly
pnpm --filter @myhealthally/web build
```

### Step 2: Start Production Server

```bash
cd packages/web
pnpm start
```

Or from root:
```bash
pnpm --filter @myhealthally/web start
```

### Step 3: View the App

The production server will start on **port 3000** by default:

**Open in browser**: `http://localhost:3000`

If port 3000 is already in use, Next.js will automatically use the next available port (3001, 3002, etc.). Check the terminal output to see which port it's using.

## Using a Specific Port

To use a specific port:

```bash
PORT=3001 pnpm --filter @myhealthally/web start
```

Or on Windows PowerShell:
```powershell
$env:PORT=3001; pnpm --filter @myhealthally/web start
```

## Development vs Production

- **Development**: `pnpm dev` → Usually `http://localhost:3000` (or next available)
- **Production Build**: `pnpm build` then `pnpm start` → Usually `http://localhost:3000` (or next available)

## Note

The production build is optimized and minified, so it will be faster but won't show detailed error messages like the dev server.

---

**After testing locally, deploy to Vercel to see it live!**

