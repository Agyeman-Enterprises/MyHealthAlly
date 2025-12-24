# MyHealth Ally - Production Configuration Guide

**Date:** December 2024  
**Status:** Complete configuration guide for production deployment

---

## 🎯 **Overview**

This guide covers all production configuration steps needed before deploying MyHealth Ally to production.

---

## 📋 **Configuration Checklist**

- [ ] Certificate pinning configured
- [ ] Production API URLs set
- [ ] Environment variables configured
- [ ] Android release build configured
- [ ] PWA production build configured
- [ ] Security settings verified

---

## 1. **Certificate Pinning (Android)**

### **Location:**
`app/src/main/java/com/agyeman/myhealthally/data/api/SoloPracticeApiClient.kt`

### **Step 1: Get Certificate Pin**

Run this command to get your production server's certificate pin:

```bash
openssl s_client -connect your-domain.com:443 -showcerts | \
  openssl x509 -pubkey -noout | \
  openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

**Example output:**
```
sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
```

### **Step 2: Update Certificate Pinner**

**File:** `app/src/main/java/com/agyeman/myhealthally/data/api/SoloPracticeApiClient.kt`

**Current (lines 44-54):**
```kotlin
val certificatePinner = if (BuildConfig.DEBUG) {
    CertificatePinner.DEFAULT
} else {
    // Production: Pin the certificate
    // TODO: Replace with actual certificate pin from your production server
    CertificatePinner.Builder()
        // Example format - replace with actual pin
        // .add("your-solopractice-domain.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
        .build()
}
```

**Update to:**
```kotlin
val certificatePinner = if (BuildConfig.DEBUG) {
    CertificatePinner.DEFAULT
} else {
    // Production: Pin the certificate
    CertificatePinner.Builder()
        .add("your-production-domain.com", "sha256/YOUR_ACTUAL_PIN_HERE")
        .build()
}
```

**Replace:**
- `your-production-domain.com` with your actual domain
- `YOUR_ACTUAL_PIN_HERE` with the pin from Step 1

### **Step 3: Test Certificate Pinning**

1. Build a release APK
2. Install on a test device
3. Verify API calls work
4. Check logs for certificate pinning errors

---

## 2. **Production API URLs (Android)**

### **Location:**
`app/build.gradle.kts`

### **Current Configuration:**

**Release Build (line 31):**
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://your-solopractice-domain.com\"")
```

**Debug Build (line 38):**
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3000\"")
```

### **Update Release Build:**

**File:** `app/build.gradle.kts`

**Change line 31 to:**
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://api.your-production-domain.com\"")
```

**Replace `api.your-production-domain.com` with your actual production API domain.**

### **Example:**
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://api.solopractice.com\"")
```

---

## 3. **Production API URLs (PWA)**

### **Step 1: Create Production Environment File**

**File:** `pwa/.env.production`

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-production-domain.com
```

**Replace `api.your-production-domain.com` with your actual production API domain.**

### **Step 2: Verify .gitignore**

Ensure `.env.production` is in `.gitignore` (should already be there).

### **Step 3: Build Production PWA**

```bash
cd pwa
npm run build
```

The production build will use `.env.production` automatically.

---

## 4. **Local Development Configuration (PWA)**

### **Create Local Environment File**

**File:** `pwa/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

**Note:** `.env.local` is already in `.gitignore` and won't be committed.

---

## 5. **Android Release Build Configuration**

### **Step 1: Configure Signing**

**File:** `app/build.gradle.kts`

Add signing configuration:

```kotlin
android {
    // ... existing config ...
    
    signingConfigs {
        create("release") {
            storeFile = file("path/to/your/keystore.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD") ?: ""
            keyAlias = System.getenv("KEY_ALIAS") ?: ""
            keyPassword = System.getenv("KEY_PASSWORD") ?: ""
        }
    }
    
    buildTypes {
        release {
            // ... existing config ...
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

### **Step 2: Create Keystore**

```bash
keytool -genkey -v -keystore myhealthally-release.keystore \
  -alias myhealthally -keyalg RSA -keysize 2048 -validity 10000
```

**Store the keystore securely and never commit it to git!**

### **Step 3: Set Environment Variables**

Set these environment variables before building:

```bash
export KEYSTORE_PASSWORD=your-keystore-password
export KEY_ALIAS=myhealthally
export KEY_PASSWORD=your-key-password
```

### **Step 4: Build Release APK**

```bash
./gradlew assembleRelease
```

**Output:** `app/build/outputs/apk/release/app-release.apk`

---

## 6. **PWA Production Build**

### **Step 1: Install Dependencies**

```bash
cd pwa
npm install
```

### **Step 2: Create Production Environment**

Copy `.env.production.example` to `.env.production` and update:

```bash
cp .env.production.example .env.production
# Edit .env.production with your production API URL
```

### **Step 3: Build Production**

```bash
npm run build
```

**Output:** `pwa/.next/` directory

### **Step 4: Test Production Build**

```bash
npm start
```

This runs the production build locally for testing.

---

## 7. **Security Verification**

### **Android Security Checklist:**

- [ ] `android:allowBackup="false"` in AndroidManifest.xml ✅
- [ ] `android:usesCleartextTraffic="false"` in AndroidManifest.xml ✅
- [ ] Certificate pinning configured ✅
- [ ] ProGuard rules configured ✅
- [ ] Release build uses production API URL ✅

### **PWA Security Checklist:**

- [ ] HTTPS enforced in production ✅
- [ ] Environment variables not exposed in client code ✅
- [ ] API keys stored securely ✅
- [ ] CORS configured correctly ✅

---

## 8. **Environment Variables Summary**

### **Android (build.gradle.kts):**
- `API_BASE_URL` - Set in build.gradle.kts for release build

### **PWA (.env files):**
- `NEXT_PUBLIC_API_BASE_URL` - Set in .env.production for production

### **Certificate Pinning:**
- Certificate pin - Set in SoloPracticeApiClient.kt

---

## 9. **Deployment Checklist**

### **Before Deploying:**

- [ ] Certificate pinning configured and tested
- [ ] Production API URLs set in all locations
- [ ] Environment variables configured
- [ ] Release build tested locally
- [ ] Production PWA build tested locally
- [ ] Security settings verified
- [ ] API endpoints accessible from production domains
- [ ] CORS configured for production domains

### **After Deploying:**

- [ ] Test Android app with production API
- [ ] Test PWA with production API
- [ ] Verify certificate pinning works
- [ ] Monitor error logs
- [ ] Test authentication flow
- [ ] Test all critical features

---

## 10. **Troubleshooting**

### **Certificate Pinning Errors:**

**Error:** `Certificate pinning failure`

**Solution:**
1. Verify certificate pin is correct
2. Check domain matches exactly
3. Ensure certificate hasn't changed
4. Test with debug build first (pinning disabled)

### **API Connection Errors:**

**Error:** `Failed to connect to API`

**Solution:**
1. Verify API URL is correct
2. Check network connectivity
3. Verify CORS is configured
4. Check API server is running
5. Verify SSL certificate is valid

### **Environment Variable Issues:**

**Error:** `API_BASE_URL is undefined`

**Solution:**
1. Verify .env.production exists
2. Check variable name matches exactly
3. Rebuild after changing .env files
4. Verify .env file is in correct location

---

## 📝 **Quick Reference**

### **Certificate Pin Command:**
```bash
openssl s_client -connect your-domain.com:443 -showcerts | \
  openssl x509 -pubkey -noout | \
  openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

### **Android Release Build:**
```bash
./gradlew assembleRelease
```

### **PWA Production Build:**
```bash
cd pwa
npm run build
npm start  # Test production build
```

---

## ✅ **Configuration Complete**

Once all steps are completed:

1. ✅ Certificate pinning configured
2. ✅ Production API URLs set
3. ✅ Environment variables configured
4. ✅ Security verified
5. ✅ Ready for production deployment

---

**Last Updated:** December 2024  
**Next Step:** Test production builds, then deploy
