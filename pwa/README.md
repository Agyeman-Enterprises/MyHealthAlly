# MyHealth Ally PWA

**Progressive Web App for Patient and Provider Portal**

## 🎯 Overview

This PWA provides a web-based interface for:
- **Patients:** Access messages, vitals, medications, appointments
- **Providers:** Manage patients, view messages, handle workflows
- **Integration:** Works seamlessly with native MyHealth Ally app and Solopractice backend

## 🏗️ Architecture

```
PWA (Next.js)
├── Patient Portal
│   ├── Messages
│   ├── Vitals Tracking
│   ├── Medications
│   └── Appointments
├── Provider Portal (Future)
│   ├── Dashboard
│   ├── Message Queue
│   └── Patient Management
└── Shared
    ├── API Client (Solopractice)
    ├── Authentication
    └── State Management
```

## 🔌 Integration

### Solopractice Backend
- Uses same API endpoints as native app
- All CG rules (R1-R12) enforced server-side
- JWT authentication
- Same data models and responses

### Native App Compatibility
- Same authentication flow
- Same API endpoints
- Shared data via Solopractice backend
- Consistent user experience

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd pwa
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### Build

```bash
npm run build
npm start
```

## 📱 PWA Features

- ✅ Installable (Add to Home Screen)
- ✅ Offline support (Service Worker)
- ✅ Responsive design (Mobile + Desktop)
- ✅ Push notifications (Future)
- ✅ App-like experience

## 🔐 Authentication

1. Patient receives activation link/token
2. Enters token in PWA
3. PWA calls `/api/portal/auth/activate`
4. Receives JWT tokens
5. Tokens stored in localStorage (encrypted in production)
6. All API calls include JWT in Authorization header

## 📋 Features

### Patient Features
- ✅ View messages
- ✅ Send messages (with symptom screen for after-hours)
- ✅ Record vital signs (BP, weight, etc.)
- ✅ View medications
- ✅ Request medication refills
- ✅ View measurement history
- ✅ Handle deferred/blocked responses

### Provider Features (Future)
- ⏳ Provider dashboard
- ⏳ Message queue management
- ⏳ Patient management
- ⏳ Workflow handling

## 🎨 Design

- Material Design 3 principles
- Teal primary color (#00bcd4)
- Responsive layout
- Accessible components

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **PWA:** next-pwa
- **API Client:** Axios

## 🔗 API Integration

All API calls go through `lib/api/solopractice-client.ts`:
- Authentication
- Messages
- Medications
- Measurements
- Appointments

Same endpoints as native app:
- `POST /api/portal/auth/activate`
- `GET /api/portal/messages/threads`
- `POST /api/portal/messages/threads/[id]/messages`
- `POST /api/portal/measurements`
- `POST /api/portal/meds/refill-requests`
- etc.

## 🚨 CG Rules Enforcement

All CG rules (R1-R12) are enforced server-side in Solopractice:
- R1: Practice Hours
- R2: Emergency Intercept
- R3: After-Hours Deferral
- R4: Urgency Classification
- R5: Hard Escalation
- R7: Refill Safety Gate
- R10: Patient Transparency
- etc.

PWA displays server responses (sent, deferred, blocked) appropriately.

## 📱 PWA Installation

Users can install the PWA:
1. Visit the site
2. Browser prompts "Add to Home Screen"
3. PWA installs like native app
4. Works offline (cached resources)
5. App-like experience

## 🔄 Sync with Native App

Both PWA and native app:
- Use same Solopractice backend
- Share same data
- Same authentication
- Consistent experience
- Real-time sync via backend

## 📚 Documentation

- **API Integration:** See `lib/api/solopractice-client.ts`
- **State Management:** See `lib/store/auth-store.ts`
- **Components:** See `app/` directory

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

Build and deploy the `out` directory (static export) or use Node.js hosting.

## 🔐 Security

- JWT tokens stored securely
- HTTPS required for PWA
- Service Worker for offline caching
- No PHI in client-side code
- All sensitive operations server-side

---

**Status:** Patient portal complete, Provider portal in progress
