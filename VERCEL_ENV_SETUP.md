# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

When deploying to Vercel, you **must** set these environment variables in your Vercel project settings:

### 1. Backend API URL
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```
OR
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Important:** 
- Replace `https://your-backend-url.com` with your actual backend API URL
- If your backend is also on Vercel, use the Vercel deployment URL
- If your backend is on a different service, use that service's URL
- **Do NOT include a trailing slash** (e.g., use `https://api.example.com` not `https://api.example.com/`)

### 2. Optional: Builder.io API Key (if using Builder.io)
```
NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY=your-builder-api-key
```

### 3. Optional: App Version
```
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add each variable:
   - **Key:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** Your backend API URL (e.g., `https://myhealthally-api.vercel.app`)
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

---

## Testing Environment Variables

After setting the variables, you can verify they're working:

1. Check the browser console for any API connection errors
2. Look for network requests in the browser DevTools
3. The app should connect to your backend API instead of localhost

---

## Common Issues

### Issue: "Unable to connect to the server"
**Solution:** 
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in Vercel
- Make sure your backend is deployed and accessible
- Check that the URL doesn't have a trailing slash
- Redeploy after setting environment variables

### Issue: CORS errors
**Solution:**
- Make sure your backend allows requests from your Vercel domain
- Check backend CORS configuration

### Issue: Still using localhost
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Verify environment variables are set in Vercel
- Redeploy the application

---

## Example Configuration

If your backend is deployed at `https://myhealthally-api.vercel.app`:

```
NEXT_PUBLIC_API_BASE_URL=https://myhealthally-api.vercel.app
```

The app will automatically use this URL instead of `localhost:3001`.

---

## Development vs Production

- **Local Development:** Uses `http://localhost:3001` as fallback
- **Vercel Production:** Uses `NEXT_PUBLIC_API_BASE_URL` environment variable

Make sure to set the environment variable in Vercel for production deployments!

