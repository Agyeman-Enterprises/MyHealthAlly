# PWA Installation Guide

## 📱 How to Install MyHealth Ally PWA

### Prerequisites

1. **Development (Local Testing):**
   - App must be running on `localhost` (works without HTTPS)
   - Run: `npm run dev` (from `pwa` directory)
   - Access at: `http://localhost:3000`

2. **Production (Real Devices):**
   - App must be served over **HTTPS** (required for PWA installation)
   - Deploy to a hosting service (Vercel, Netlify, etc.) or use a local HTTPS server

---

## 🍎 **iPhone / iPad Installation**

### Step 1: Open in Safari
1. Open **Safari** (not Chrome or other browsers)
2. Navigate to your app URL:
   - Development: `http://localhost:3000` (if on same network)
   - Production: `https://your-domain.com`

### Step 2: Add to Home Screen
1. Tap the **Share button** (square with arrow pointing up) at the bottom
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if desired (default: "MyHealth Ally")
4. Tap **"Add"** in the top right

### Step 3: Launch
- Find the app icon on your home screen
- Tap to open (runs in standalone mode, no browser UI)

---

## 🤖 **Samsung / Android Installation**

### Step 1: Open in Chrome
1. Open **Chrome** browser
2. Navigate to your app URL:
   - Development: `http://localhost:3000` (if on same network)
   - Production: `https://your-domain.com`

### Step 2: Install Prompt
- Chrome will show an **"Install App"** banner at the bottom
- OR tap the **menu** (3 dots) → **"Install app"** or **"Add to Home screen"**

### Step 3: Confirm Installation
1. Review the app details
2. Tap **"Install"**
3. The app will be added to your home screen

### Alternative (Manual):
1. Tap **menu** (3 dots) → **"Add to Home screen"**
2. Edit name if needed
3. Tap **"Add"**

---

## 📱 **iPad Installation**

### Same as iPhone, but:
- Works in **both portrait and landscape** modes
- Layout automatically adapts to larger screen
- Bottom navigation is hidden on iPad (uses top navigation)

---

## 🖥️ **Local Development Setup**

### Option 1: Same Device (localhost)
1. Start dev server: `npm run dev` (from `pwa` directory)
2. Open `http://localhost:3000` in browser
3. Follow device-specific steps above

### Option 2: Network Access (Same WiFi)
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
2. Start dev server: `npm run dev`
3. On your phone/tablet, open: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`
4. Follow device-specific installation steps

### Option 3: Production Build (Full PWA Features)
**⚠️ NOT READY YET:** Production build requires completion of:
- Settings (database integration)
- Education (content loading)
- Care Plan (database integration)

**Note:** PWA features (service worker, offline mode) are disabled in development mode. Once the above features are complete:

1. Build for production:
   ```bash
   cd pwa
   npm run build
   npm run start
   ```

2. Access at `http://localhost:3000` (or your network IP)

3. Install using device-specific steps above

---

## ✅ **Verification**

After installation, you should see:
- ✅ App icon on home screen
- ✅ Opens in standalone mode (no browser UI)
- ✅ Works offline (cached pages)
- ✅ Safe area handling (notched devices)
- ✅ Responsive layout (adapts to screen size)

---

## 🔧 **Troubleshooting**

### "Install" option not showing?
- **iPhone:** Must use Safari (not Chrome)
- **Android:** Must use Chrome (not Samsung Internet)
- **HTTPS required** (except localhost)
- **Manifest must be valid** (check browser console)

### App not working offline?
- PWA features disabled in dev mode
- **Production build not ready yet** (Settings, Education, Care Plan need completion)
- Once ready: `npm run build && npm run start`
- Service worker must be registered (check DevTools → Application → Service Workers)

### Can't access localhost from phone?
- Ensure phone and computer are on **same WiFi network**
- Check firewall isn't blocking port 3000
- Use your computer's IP address instead of `localhost`

### Safe areas not working?
- Ensure `viewport-fit=cover` is set (already configured)
- Test on actual device (not just browser emulator)

---

## 📝 **Quick Commands**

```bash
# Start development server
cd pwa
npm run dev

# Build for production (enables full PWA)
# ⚠️ NOT READY: Requires Settings, Education, Care Plan completion
cd pwa
npm run build
npm run start

# Check if running
# Open http://localhost:3000 in browser
```

---

## 🚀 **Production Deployment**

For production installation, deploy to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Your own server** (with HTTPS certificate)

Once deployed with HTTPS, users can install from any device using the steps above.

---

**Last Updated:** December 2024
