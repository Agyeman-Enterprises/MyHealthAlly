# How to Access MyHealthAlly

## ⚠️ Important: Use Browser Address Bar, NOT Google Search

**Don't paste the URL into Google search!** Instead:

### ✅ Correct Way:
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Click in the **address bar** at the top (where you normally type URLs)
3. Type or paste: `http://localhost:3001/patient/login`
4. Press Enter

### ❌ Wrong Way:
- Don't paste it into Google search
- Don't search for "localhost:3001"
- Don't use Google's search bar

## 🚀 Quick Start

### Step 1: Start the Servers
```bash
pnpm install
```

This automatically starts both backend and frontend servers.

### Step 2: Open in Browser
Once servers are running, open your browser and go to:

**Patient App:**
- Login: `http://localhost:3001/patient/login`
- Dashboard: `http://localhost:3001/patient/dashboard`

**Provider Dashboard:**
- Login: `http://localhost:3001/login`
- Dashboard: `http://localhost:3001/dashboard`

## 🔍 Verify Servers Are Running

Check if servers are running:
- Backend: http://localhost:3000/health
- Frontend: http://localhost:3001

If you see "This site can't be reached" or connection errors:
1. Make sure you ran `pnpm install` or `pnpm start`
2. Wait a few seconds for servers to start
3. Check the terminal for any error messages

## 📱 Direct Links

Copy and paste these directly into your browser address bar:

- **Patient Login**: http://localhost:3001/patient/login
- **Patient Dashboard**: http://localhost:3001/patient/dashboard
- **Provider Login**: http://localhost:3001/login
- **Provider Dashboard**: http://localhost:3001/dashboard

## 🛑 Troubleshooting

**"This site can't be reached"**
- Servers aren't running → Run `pnpm start`

**"Connection refused"**
- Port is in use → Kill existing processes or change ports

**Page loads but shows errors**
- Backend not running → Check http://localhost:3000/health

**Still seeing Google search results?**
- You're searching instead of navigating → Use the address bar, not search!

