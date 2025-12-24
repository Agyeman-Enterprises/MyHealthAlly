# Production Configuration Checklist

**Date:** December 2024  
**Use this checklist to verify all production configuration is complete**

---

## ✅ **Configuration Steps**

### **1. Certificate Pinning (Android)**

- [ ] Get certificate pin from production server
  ```bash
  openssl s_client -connect your-domain.com:443 -showcerts | \
    openssl x509 -pubkey -noout | \
    openssl pkey -pubin -outform der | \
    openssl dgst -sha256 -binary | \
    openssl enc -base64
  ```

- [ ] Update `SoloPracticeApiClient.kt`
  - [ ] Replace `your-production-domain.com` with actual domain
  - [ ] Replace `YOUR_CERTIFICATE_PIN_HERE` with actual pin
  - [ ] File: `app/src/main/java/com/agyeman/myhealthally/data/api/SoloPracticeApiClient.kt`

### **2. Android Production API URL**

- [ ] Update `build.gradle.kts`
  - [ ] Replace `api.your-production-domain.com` with actual API domain
  - [ ] File: `app/build.gradle.kts` (line 31)

### **3. PWA Production Environment**

- [ ] Create `pwa/.env.production`
  - [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production API URL
  - [ ] Verify file is in `.gitignore`

### **4. PWA Local Development Environment**

- [ ] Create `pwa/.env.local`
  - [ ] Set `NEXT_PUBLIC_API_BASE_URL` to local development URL
  - [ ] Verify file is in `.gitignore`

### **5. Android Release Build**

- [ ] Configure signing (if not already done)
  - [ ] Create keystore
  - [ ] Update `build.gradle.kts` with signing config
  - [ ] Set environment variables for passwords

- [ ] Test release build
  ```bash
  ./gradlew assembleRelease
  ```

### **6. PWA Production Build**

- [ ] Test production build
  ```bash
  cd pwa
  npm run build
  npm start  # Test locally
  ```

---

## 🔍 **Verification Steps**

### **Android App:**

- [ ] Release build compiles successfully
- [ ] API calls work with production URL
- [ ] Certificate pinning works (test with invalid pin to verify)
- [ ] No cleartext traffic warnings
- [ ] ProGuard obfuscation working

### **PWA:**

- [ ] Production build completes successfully
- [ ] API calls use production URL
- [ ] Environment variables loaded correctly
- [ ] No console errors
- [ ] All features work in production build

---

## 📝 **Configuration Values to Replace**

### **Certificate Pinning:**
- Domain: `your-production-domain.com` → Your actual domain
- Pin: `YOUR_CERTIFICATE_PIN_HERE` → Actual certificate pin

### **API URLs:**
- Android: `api.your-production-domain.com` → Your actual API domain
- PWA: `api.your-production-domain.com` → Your actual API domain

---

## ⚠️ **Important Notes**

1. **Never commit:**
   - `.env.production`
   - `.env.local`
   - Keystore files
   - Certificate pins (if sensitive)

2. **Always test:**
   - Production builds before deploying
   - Certificate pinning with test builds
   - API connectivity from production domains

3. **Document:**
   - Keep production URLs documented (but not in git)
   - Store certificate pins securely
   - Keep keystore passwords secure

---

## ✅ **Completion**

Once all items are checked:

- [ ] All configuration values replaced
- [ ] All builds tested
- [ ] All verification steps passed
- [ ] Ready for production deployment

---

**See:** `PRODUCTION_CONFIGURATION.md` for detailed instructions
