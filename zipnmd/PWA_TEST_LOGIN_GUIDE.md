# PWA Test Login Guide

**Date:** December 2024  
**Purpose:** How to test the MyHealth Ally PWA on desktop

---

## 🔐 **Authentication System**

The PWA uses **token-based activation** for patients and **provider login** for providers/admins.

---

## 👤 **Patient Login (Activation Token)**

### **How It Works:**
1. Patient receives an activation token (via email/SMS from practice)
2. Patient enters token on login page
3. Token is exchanged for access/refresh tokens
4. Patient is logged in

### **Testing Patient Portal:**

#### **Option 1: Get Test Token from Backend**
You need to get a test activation token from your Solopractice backend:

1. **In Solopractice Backend:**
   - Create a test patient
   - Generate an activation token for that patient
   - Use that token in the PWA

2. **API Endpoint:**
   ```
   POST /api/portal/auth/activate
   Body: { "token": "your-activation-token" }
   ```

#### **Option 2: Create Test Token Endpoint (Recommended for Testing)**
Add a test endpoint in Solopractice backend:

```typescript
// app/api/portal/auth/test-token/route.ts
export async function GET() {
  // Generate a test activation token
  // Return it for testing purposes
  return NextResponse.json({
    token: "test-token-12345",
    patient_id: "test-patient-id",
    practice_id: "test-practice-id"
  });
}
```

#### **Option 3: Mock Authentication (Development Only)**
For local testing, you can temporarily bypass authentication:

**File:** `pwa/app/auth/login/page.tsx`

Add a test button (remove before production):

```typescript
// TEST ONLY - Remove before production
const handleTestLogin = () => {
  login(
    "test-access-token",
    "test-refresh-token",
    "test-patient-id",
    "test-practice-id",
    "patient"
  );
  router.push('/dashboard');
};

// Add to JSX:
<button onClick={handleTestLogin} className="mt-4 text-sm text-blue-600">
  Test Login (Dev Only)
</button>
```

---

## 👨‍⚕️ **Provider Login**

### **How It Works:**
1. Provider enters email/password
2. Backend authenticates and returns tokens
3. Provider is logged in with provider/admin role

### **Testing Provider Portal:**

#### **Option 1: Use Provider Login Endpoint**
The provider login endpoint should exist in Solopractice:

```
POST /api/provider/auth/login
Body: {
  "email": "provider@example.com",
  "password": "password"
}
```

#### **Option 2: Create Test Provider Account**
In Solopractice backend, create a test provider:

```sql
-- Create test provider user
INSERT INTO auth.users (email, encrypted_password) 
VALUES ('test-provider@example.com', 'hashed-password');

-- Create provider record
INSERT INTO providers (user_id, practice_id, role)
VALUES ('user-id', 'practice-id', 'provider');
```

#### **Option 3: Add Provider Login Page**
Currently, the PWA only has patient activation. You may need to add a provider login page:

**File:** `pwa/app/provider/login/page.tsx` (create this)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { providerApiClient } from '@/lib/api/provider-client';

export default function ProviderLoginPage() {
  const router = useRouter();
  const loginProvider = useAuthStore((state) => state.loginProvider);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await providerApiClient.login(email, password);
      loginProvider(
        response.access_token,
        response.refresh_token,
        response.practice_id,
        response.user_id,
        response.role
      );
      router.push('/provider/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <h2 className="text-3xl font-bold text-center">Provider Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 🚀 **Quick Test Setup**

### **For Patient Portal Testing:**

1. **Start PWA Dev Server:**
   ```bash
   cd pwa
   npm run dev
   ```

2. **Access:** http://localhost:3000

3. **Get Test Token:**
   - Contact backend developer for test activation token
   - OR use test endpoint if available
   - OR temporarily add test login button (dev only)

4. **Enter Token:**
   - Go to `/auth/login`
   - Enter activation token
   - Click "Activate Account"

### **For Provider Portal Testing:**

1. **Access Provider Login:**
   - Go to `/provider/login` (if exists)
   - OR create the page (see above)

2. **Use Test Credentials:**
   - Email: `test-provider@example.com`
   - Password: (get from backend)

3. **Or Direct Access:**
   - If you have tokens, you can manually set them in browser console:
   ```javascript
   // In browser console on PWA
   localStorage.setItem('auth-storage', JSON.stringify({
     state: {
       isAuthenticated: true,
       accessToken: 'test-token',
       refreshToken: 'test-refresh',
       practiceId: 'test-practice-id',
       userId: 'test-user-id',
       role: 'provider'
     }
   }));
   // Then refresh page
   ```

---

## 📝 **Test Accounts Needed**

### **From Solopractice Backend:**

1. **Test Patient:**
   - Patient ID
   - Activation token
   - Practice ID

2. **Test Provider:**
   - Email
   - Password
   - Provider ID
   - Practice ID
   - Role (provider/admin)

3. **Test Admin:**
   - Email
   - Password
   - Admin ID
   - Practice ID
   - Role (admin)

---

## 🔧 **Development Shortcuts**

### **Bypass Authentication (Dev Only):**

**File:** `pwa/app/page.tsx`

Temporarily modify to auto-login:

```typescript
useEffect(() => {
  // DEV ONLY - Remove before production
  if (process.env.NODE_ENV === 'development') {
    login(
      'dev-access-token',
      'dev-refresh-token',
      'dev-patient-id',
      'dev-practice-id',
      'patient'
    );
    router.push('/dashboard');
    return;
  }
  
  // Normal flow
  if (isAuthenticated) {
    router.push('/dashboard');
  } else {
    router.push('/auth/login');
  }
}, [isAuthenticated, router, login]);
```

---

## ✅ **Recommended Approach**

### **For Testing:**

1. **Ask Backend Developer:**
   - Request test activation tokens
   - Request test provider credentials
   - Get test practice/patient IDs

2. **Create Test Endpoint:**
   - Add `/api/portal/auth/test-token` endpoint
   - Returns test tokens for development
   - Disable in production

3. **Use Environment Variables:**
   ```env
   # .env.local
   NEXT_PUBLIC_TEST_MODE=true
   NEXT_PUBLIC_TEST_TOKEN=test-token-12345
   ```

---

## 🎯 **Next Steps**

1. **Contact Solopractice Backend Team:**
   - Request test activation tokens
   - Request test provider accounts
   - Get API endpoint documentation

2. **Or Create Test Endpoints:**
   - Add test token generation
   - Add test provider creation
   - Document test credentials

3. **Test Both Portals:**
   - Patient portal with activation token
   - Provider portal with email/password

---

**Last Updated:** December 2024  
**Status:** Need test credentials from backend or create test endpoints
