# MyHealthAlly (MHA) - Implementation Plan
**Using: Next.js + Supabase + Vercel + GitHub**

---

## 🎯 Architecture Decision

**MHA Stack:**
- ✅ **Next.js 14** (App Router) - PWA frontend
- ✅ **Supabase** - Database, Auth, Storage, Realtime
- ✅ **Vercel** - Deployment
- ✅ **GitHub** - Version control
- ✅ **Android** - Kotlin + Jetpack Compose (native)
- ✅ **iOS** - PWA (Next.js in browser)

**SoloPractice:**
- Separate EMR system (SSOT for patient data)
- MHA syncs to/from SoloPractice via API

---

## 📁 Project Structure

```
MyHealthAlly-1/
├── app/                    # Android native app (Kotlin)
│   └── src/
│       ├── main/          # Uses Supabase client
│       └── test/
│
├── pwa/                    # Next.js PWA
│   ├── app/               # Next.js app router
│   │   ├── (auth)/        # Auth pages
│   │   ├── patient/       # Patient routes
│   │   └── clinician/     # Clinician routes (TO BUILD)
│   ├── lib/
│   │   ├── supabase/      # Supabase client (TO CREATE)
│   │   └── api/           # API utilities
│   ├── components/        # React components
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema (Supabase)

Based on files 01-07, create these tables in Supabase:

### Core Tables:
- `users` - User accounts
- `patients` - Patient profiles
- `clinicians` - Clinician profiles
- `practices` - Practice info

### Clinical Tables:
- `vitals` - Vital signs
- `care_plans` - Care plans
- `encounters` - Visits
- `messages` - Messaging
- `tasks` - Task management
- `labs` - Lab orders/results
- `medications` - Medications
- `alerts` - Alert system

### Supporting Tables:
- `documents` - Document storage
- `devices` - Connected devices
- `notifications` - Notifications
- `translations` - i18n content

**Note:** Full schema in files 01-07. We'll create Supabase migrations.

---

## 🔄 Sync Strategy (MHA ↔ SoloPractice)

### MHA → SoloPractice (Ingest)
When patient data is created/updated in MHA:
1. Store in Supabase (MHA's database)
2. Sync to SoloPractice via API
3. SoloPractice becomes SSOT

### SoloPractice → MHA (Sync Back)
When SoloPractice has updates:
1. SoloPractice calls MHA webhook OR
2. MHA polls SoloPractice API
3. MHA updates Supabase
4. MHA UI updates via Supabase Realtime

---

## 🚀 Implementation Phases

### Phase 1: Supabase Setup (Week 1)
- [ ] Create Supabase project
- [ ] Set up database schema (migrations)
- [ ] Configure Supabase Auth
- [ ] Set up Storage buckets
- [ ] Configure Realtime subscriptions
- [ ] Create `.env` template

### Phase 2: PWA Supabase Integration (Week 2)
- [ ] Add `@supabase/supabase-js` to PWA
- [ ] Create Supabase client utilities
- [ ] Update auth flow to use Supabase
- [ ] Migrate existing API calls to Supabase
- [ ] Set up sync service to SoloPractice

### Phase 3: Clinician Routes (Week 3-4)
- [ ] Build `/clinician/dashboard`
- [ ] Build `/clinician/patients`
- [ ] Build `/clinician/patients/[id]`
- [ ] Build `/clinician/messages`
- [ ] Build `/clinician/tasks`
- [ ] Build `/clinician/labs`
- [ ] Build `/clinician/visit/[id]`

### Phase 4: Patient Routes Enhancement (Week 5)
- [ ] Enhance existing patient routes
- [ ] Add missing features (care plan, labs, etc.)
- [ ] Improve offline support

### Phase 5: Sync & Polish (Week 6)
- [ ] Complete sync mechanism
- [ ] Error handling
- [ ] Testing
- [ ] Documentation

---

## 📝 Next Immediate Steps

1. **Create Supabase project** (if needed)
2. **Set up database schema** in Supabase SQL editor
3. **Add Supabase to PWA** - Install package, create client
4. **Build clinician routes** - Start with dashboard
5. **Implement sync** - MHA ↔ SoloPractice

**Ready to proceed with this simplified stack!**

