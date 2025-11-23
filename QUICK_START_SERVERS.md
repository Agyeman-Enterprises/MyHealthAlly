# 🚀 Quick Start - Servers

## The Problem
Error -102 means servers aren't running. The startup script now handles this automatically.

## ✅ Solution

**Just run:**
```bash
pnpm start
```

This will:
1. ✅ Check dependencies
2. ✅ Find available ports automatically
3. ✅ Start backend server
4. ✅ Wait for backend to be ready
5. ✅ Start frontend server
6. ✅ Show you the URLs

## What You'll See

The script shows **all output** so you can see:
- Port detection
- Server startup messages
- Any errors
- Final URLs

## After Servers Start

You'll see:
```
═══════════════════════════════════════════════════════════
  🎉 Servers Running!
═══════════════════════════════════════════════════════════

  Backend:  http://localhost:3000
  Frontend: http://localhost:3001
```

Then open in your browser's **address bar** (not Google search):
```
http://localhost:3001
```

## Port Conflicts?

The script automatically finds available ports. If 3000/3001 are in use, it will use 3002, 3003, etc. and tell you which ports to use.

## Troubleshooting

**Still getting error -102?**
1. Wait 20 seconds after running `pnpm start`
2. Check the terminal for error messages
3. Make sure you're using the **address bar**, not Google search

**Servers won't start?**
- Check terminal output for errors
- Make sure `.env` files exist in `packages/backend` and `packages/web`
- Run `pnpm install` if dependencies are missing

**The script is running now in the background. Check your terminal for output!**

