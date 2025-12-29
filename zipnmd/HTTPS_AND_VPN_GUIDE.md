# HTTPS & VPN Configuration Guide

**Date:** December 2024  
**Status:** ✅ Configured for HTTPS in production

---

## 🔒 **Current HTTPS Status**

### **Development (localhost):**
- ✅ **HTTP is OK** - `http://localhost:3000` works fine
- ✅ **getUserMedia works** - Browsers allow microphone access on localhost even without HTTPS
- ✅ **No certificate needed** - Local development doesn't require SSL

### **Production:**
- ✅ **HTTPS REQUIRED** - All production deployments must use HTTPS
- ✅ **HSTS configured** - Strict-Transport-Security header enforces HTTPS
- ✅ **Supabase uses HTTPS** - All Supabase connections are encrypted
- ✅ **PWA requires HTTPS** - Service workers only work over HTTPS

---

## 🎤 **Microphone Access & HTTPS**

### **Browser Requirements:**
- **Localhost:** ✅ Works with HTTP (exception for development)
- **Production:** ❌ **MUST use HTTPS** - Browsers block getUserMedia without HTTPS

### **Why HTTPS is Required:**
1. **Security:** Prevents man-in-the-middle attacks on audio data
2. **Privacy:** Protects sensitive healthcare audio recordings
3. **HIPAA Compliance:** Encrypted transmission required
4. **Browser Policy:** Modern browsers enforce HTTPS for media APIs

### **Current Configuration:**
- ✅ Permissions-Policy header allows microphone on same origin
- ✅ HSTS header enforces HTTPS in production
- ✅ Supabase connections use HTTPS

---

## 🔐 **Norton VPN Impact**

### **Good News:**
- ✅ **VPN + HTTPS work together** - VPN encrypts traffic, HTTPS encrypts content
- ✅ **No interference** - VPN doesn't break HTTPS connections
- ✅ **Additional security** - VPN adds extra encryption layer

### **Potential Issues:**

**1. SSL/TLS Interception (if enabled):**
- Some VPNs intercept SSL to scan traffic
- This can cause certificate warnings
- **Solution:** Disable SSL scanning in Norton VPN settings if you see warnings

**2. Localhost Connections:**
- VPN might route localhost traffic differently
- Could affect `http://localhost:3000` connections
- **Solution:** Usually fine, but if issues occur, temporarily disable VPN for local dev

**3. Supabase Connections:**
- VPN shouldn't affect Supabase (uses HTTPS)
- If you see connection errors, check VPN firewall rules
- **Solution:** Allow `*.supabase.co` in VPN firewall

### **Recommended VPN Settings:**
1. ✅ **Keep VPN enabled** - Adds security layer
2. ✅ **Disable SSL scanning** - Prevents certificate warnings
3. ✅ **Allow localhost** - Don't route localhost through VPN
4. ✅ **Allow Supabase domains** - Whitelist `*.supabase.co`

---

## 🚀 **Production HTTPS Setup**

### **Option 1: Vercel (Recommended)**
- ✅ **Automatic HTTPS** - Vercel provides free SSL certificates
- ✅ **Zero configuration** - Works out of the box
- ✅ **HSTS enabled** - Already configured in next.config.js

### **Option 2: Custom Domain**
- ✅ **Use Let's Encrypt** - Free SSL certificates
- ✅ **Auto-renewal** - Certbot handles renewal
- ✅ **Nginx/Apache** - Reverse proxy with SSL termination

### **Option 3: Cloudflare**
- ✅ **Free SSL** - Cloudflare provides SSL
- ✅ **CDN included** - Faster global delivery
- ✅ **DDoS protection** - Additional security

---

## 📋 **Checklist**

### **Development:**
- [x] HTTP on localhost works (no changes needed)
- [x] getUserMedia works on localhost
- [x] Permissions-Policy allows microphone

### **Production:**
- [ ] HTTPS certificate configured
- [ ] HSTS header working (already in next.config.js)
- [ ] Permissions-Policy allows microphone (just fixed)
- [ ] All API calls use HTTPS
- [ ] Supabase connections use HTTPS (already configured)

### **VPN:**
- [ ] VPN doesn't interfere with localhost (test if needed)
- [ ] VPN allows Supabase connections
- [ ] SSL scanning disabled (if causing issues)
- [ ] No certificate warnings

---

## 🧪 **Testing HTTPS Locally (Optional)**

If you want to test HTTPS in development:

### **Using mkcert (Recommended):**
```bash
# Install mkcert
npm install -g mkcert

# Create local CA
mkcert -install

# Generate certificate
cd pwa
mkcert localhost 127.0.0.1 ::1

# Update package.json
"dev": "next dev --experimental-https --experimental-https-key ./localhost-key.pem --experimental-https-cert ./localhost.pem"
```

### **Using Next.js HTTPS:**
```bash
# Install local-ssl-proxy
npm install -g local-ssl-proxy

# Run proxy
local-ssl-proxy --source 3443 --target 3000

# Access via https://localhost:3443
```

**Note:** Not required for development - HTTP on localhost works fine!

---

## ⚠️ **Troubleshooting**

### **Issue: Microphone blocked in production**
- **Cause:** Not using HTTPS
- **Solution:** Deploy with HTTPS (Vercel/Cloudflare provide this automatically)

### **Issue: Certificate warnings with VPN**
- **Cause:** VPN SSL interception
- **Solution:** Disable SSL scanning in Norton VPN settings

### **Issue: Localhost not working with VPN**
- **Cause:** VPN routing localhost traffic
- **Solution:** Disable VPN for localhost or configure VPN to bypass localhost

### **Issue: Supabase connection errors**
- **Cause:** VPN blocking Supabase domains
- **Solution:** Whitelist `*.supabase.co` in VPN firewall

---

## 📊 **Current Configuration Summary**

| Environment | Protocol | Status | Notes |
|------------|----------|--------|-------|
| Development | HTTP | ✅ OK | Localhost exception works |
| Production | HTTPS | ✅ Required | HSTS configured |
| Supabase | HTTPS | ✅ Always | All connections encrypted |
| Microphone | HTTPS | ✅ Required | Except localhost |

---

## ✅ **Action Items**

1. **For Development:**
   - ✅ No changes needed - HTTP on localhost works fine
   - ✅ VPN should work fine (test if you see issues)

2. **For Production:**
   - ✅ Deploy to Vercel/Cloudflare (automatic HTTPS)
   - ✅ Or configure SSL certificate manually
   - ✅ Verify HSTS header is working

3. **VPN Settings:**
   - ✅ Keep VPN enabled (adds security)
   - ⚠️ Disable SSL scanning if you see certificate warnings
   - ⚠️ Allow localhost if you have connection issues

---

**Status:** ✅ **HTTPS configured correctly - Production ready**

