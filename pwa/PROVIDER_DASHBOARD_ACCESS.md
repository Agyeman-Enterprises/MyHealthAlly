# How to Access the Provider Dashboard

## Quick Access

**URL:** `/provider/login` or `/provider/dashboard`

**Direct Link:**
```
http://localhost:3000/provider/login
```

---

## Access Methods

### 1. **Development Mode (Test Login)**

The login page has **test login buttons** for development:

1. Go to `/provider/login`
2. Click **"🧪 Test Provider Login (Dev Only)"** button
3. Automatically logs in as provider
4. Redirects to `/provider/dashboard`

**OR**

1. Click **"🧪 Test Admin Login (Dev Only)"** button
2. Logs in as admin (full access including Settings)

**Note:** These buttons only appear in development mode.

---

### 2. **Supabase Auth (Production)**

For real provider accounts:

1. **Create Provider User in Supabase:**
   - Go to Supabase Dashboard → Authentication → Users
   - Create new user with email/password
   - Set `role` to `'provider'` or `'admin'` in `users` table

2. **Login:**
   - Go to `/provider/login`
   - Enter email and password
   - Click "Sign In"
   - Redirects to dashboard

---

### 3. **SoloPractice API (Fallback)**

If Supabase auth fails, it tries SoloPractice API:

1. Go to `/provider/login`
2. Enter credentials
3. System tries SoloPractice API as fallback
4. Uses SoloPractice tokens if successful

---

## Setup Provider Account

### Option 1: Via Supabase Dashboard

1. **Create User:**
   - Supabase Dashboard → Authentication → Users → "Add user"
   - Email: `provider@example.com`
   - Password: (set password)
   - Auto-confirm: ✅ (for testing)

2. **Set Role:**
   - Supabase Dashboard → Table Editor → `users` table
   - Find the user you just created
   - Set `role` column to `'provider'` or `'admin'`

3. **Login:**
   - Go to `/provider/login`
   - Use the email/password you created

### Option 2: Via SQL (Direct Database)

```sql
-- Create provider user
INSERT INTO users (
  supabase_auth_id,
  email,
  role,
  status
) VALUES (
  'uuid-from-supabase-auth',
  'provider@example.com',
  'provider',
  'active'
);

-- Or set existing user to provider
UPDATE users 
SET role = 'provider' 
WHERE email = 'provider@example.com';
```

---

## Access Requirements

### Required:
- ✅ **User account** in Supabase `users` table
- ✅ **Role** = `'provider'` OR `'admin'`
- ✅ **Authenticated** via Supabase Auth

### What Happens:
- If not authenticated → Redirects to `/provider/login`
- If authenticated but wrong role → Redirects to `/provider/login`
- If authenticated with `provider` or `admin` role → Access granted

---

## Dashboard URLs

Once logged in, you can access:

- **Dashboard:** `/provider/dashboard`
- **Messages:** `/provider/messages`
- **Work Items:** `/provider/work-items`
- **Alerts:** `/provider/alerts`
- **Patients:** `/provider/patients`
- **Settings:** `/provider/settings` (admin only)

---

## Quick Test (Development)

**Fastest way to test:**

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/provider/login`
3. Click **"🧪 Test Provider Login"** button
4. You're in! 🎉

---

## Troubleshooting

### "Access Denied" or Redirects to Login

**Check:**
1. User exists in `users` table
2. `role` is set to `'provider'` or `'admin'`
3. User is authenticated (check Supabase Auth)

**Fix:**
```sql
-- Check user role
SELECT id, email, role, status FROM users WHERE email = 'your-email@example.com';

-- Set role to provider
UPDATE users SET role = 'provider' WHERE email = 'your-email@example.com';
```

### Can't See Dashboard Stats

**Check:**
- Database has data in `message_threads`, `tasks`, `patients` tables
- User has proper RLS permissions
- Supabase connection is working

### Test Login Not Working

**Check:**
- You're in development mode (`NODE_ENV !== 'production'`)
- Browser console for errors
- Zustand store is persisting auth state

---

## Security Notes

- **Role-based access:** Only `provider` or `admin` roles can access
- **Route protection:** All `/provider/*` routes check authentication + role
- **RLS policies:** Database queries respect Row-Level Security
- **Session management:** Auth state persisted in localStorage + cookies

---

## Summary

**Easiest way (dev):**
1. Go to `/provider/login`
2. Click test login button
3. Done!

**Production way:**
1. Create user in Supabase with `role = 'provider'`
2. Login with email/password
3. Access dashboard

The dashboard is **fully implemented in MHA** and reads from MHA's Supabase database directly.
