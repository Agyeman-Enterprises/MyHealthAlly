# MyHealthAlly Login Credentials

## 🔐 Application Login Credentials

### Staff/Provider Login
**URL:** `http://localhost:3001/login`

**Clinician Account:**
- Email: `dr@example.com`
- Password: `demo123`
- Role: Provider

**Medical Assistant Account:**
- Email: `ma@example.com`
- Password: `demo123`
- Role: Medical Assistant

### Patient Login
**URL:** `http://localhost:3001/patient/login`

Patient accounts are created during database seeding. Check `packages/backend/prisma/seed.ts` for patient email addresses.

## 🎨 Builder.io Sign-In

**URL:** https://builder.io

Sign in with your Builder.io account credentials.

**Public API Key (already configured):**
```
27c0a1050b53444993b6c4968fdc6bd1
```

**Location:** `packages/web/.env.local`

## 📝 Setup Instructions

1. **Seed the database** (if not already done):
   ```bash
   cd packages/backend
   pnpm prisma db seed
   ```

2. **Start the servers**:
   ```bash
   # From root directory
   node start-servers.js
   ```

3. **Access the application**:
   - Staff login: http://localhost:3001/login
   - Patient login: http://localhost:3001/patient/login

## 🔑 Builder.io Models to Create

After signing into Builder.io, create these models:

1. **patient-page** - For patient-facing pages
2. **staff-page** - For staff-facing pages  
3. **marketing-page** - For marketing site

Then create content entries for each route (e.g., `/patient/dashboard`, `/staff/home`).

