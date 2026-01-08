# MyHealthAlly (MHA) - Product Architecture

**Your Health, Your Language, Your Control**

---

## Vision

MHA is a **Patient Super App** that empowers users to manage their health independently while providing seamless pathways to connect with healthcare providers when needed.

---

## Three Operating Modes

```
┌─────────────────────────────────────────────────────────────┐
│ ALWAYS ON: Self-tracking (meds, labs, vitals, care plans)  │
│            Voice logging in ANY language                    │
├─────────────────────────────────────────────────────────────┤
│ OPTIONAL:  Browse Marketplace → One-Off → Temp → Permanent │
├─────────────────────────────────────────────────────────────┤
│ WHEN CONNECTED: Hospital alerts, handoffs, never lost      │
└─────────────────────────────────────────────────────────────┘
```

### Mode 1: Wellness Mode (Always Available)
**No provider required.** Works like BodySite - your personal health record.

- Voice log everything in ANY language
- Track medications, vitals, labs
- Manage care plans
- Journal thoughts and feelings
- Camera input for data capture
- AI health assistant

### Mode 2: Marketplace Mode (Optional)
**Find and connect with providers** when you need them.

- **Browse** - No commitment, explore providers
- **One-Off** - Single consultation for acute needs
- **Temporary** - Short-term relationship (post-op, acute illness)
- **Permanent** - Longitudinal PCP relationship

### Mode 3: Care Continuity Mode (When Connected)
**Never disappear from view** - seamless transitions between care settings.

- Provider notified on hospital admission
- Records shared with inpatient team
- Discharge summary flows back to outpatient
- No missed handoffs or lost medication changes

---

## Feature Access Matrix

| Feature | Wellness Mode | One-Off | Temporary | Permanent |
|---------|--------------|---------|-----------|-----------|
| **Enter Medications** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Track Vitals** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Enter Labs** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Create Care Plans** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **View Medical History** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **AI Assistant** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Share Data with Provider** | ❌ No provider | ✅ On-demand | ✅ Based on permissions | ✅ Ongoing |
| **Message Provider** | ❌ No provider | ✅ During consultation | ✅ During relationship | ✅ Always |
| **Request Appointments** | ❌ No provider | ✅ One-time | ✅ During relationship | ✅ Always |
| **Request Refills** | ❌ No provider | ❌ One-off only | ✅ During relationship | ✅ Always |
| **Provider Calendar** | ❌ No provider | ❌ One-off only | ⚠️ If enabled | ✅ Always |

**Key Principle:** Wellness features are ALWAYS available. Provider features are ADDITIVE.

---

## Competitive MOATs

### MOAT #1: Universal Language Translation
**Award-winning capability - must be 100% achieved to ship**

```
User Voice (Spanish) → Whisper API → Spanish Text 
                                          ↓
                              Google Translate → English Text → Stored
                                          
Provider Response (English) → Google Translate → Spanish Text 
                                          ↓
                                   TTS → User hears Spanish
```

- User speaks ANY of 46+ supported languages
- Automatically transcribed to ENGLISH for clinic
- Provider responses translated BACK to user's language
- NO communication barriers ever
- Medical terminology glossary for accuracy

**Supported Languages:**
English, Spanish, Chinese, Tagalog, Vietnamese, Korean, Japanese, Arabic, French, German, Portuguese, Russian, Hindi, Bengali, Punjabi, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Thai, Indonesian, Turkish, Polish, Ukrainian, Romanian, Dutch, Greek, Hungarian, Czech, Swedish, Danish, Finnish, Norwegian, Hebrew, Persian, Swahili, Amharic, Somali, Hausa, Yoruba, Igbo, Zulu, Cebuano, Hmong, Lao, Burmese, Khmer, Nepali

### MOAT #2: Care Continuity
**Patient NEVER disappears from view**

```
OUTPATIENT ──→ ADMITTED ──→ DISCHARGED ──→ OUTPATIENT
     │              │              │              │
     │              ▼              ▼              │
     │        PCP alerted    Discharge summary   │
     │        Records shared  sent to PCP        │
     └──────────────────────────────────────────┘
                  Continuous visibility
```

- Primary care KNOWS when patient hospitalized (real-time)
- Records flow to inpatient team on patient consent
- Discharge summary automatically flows back to outpatient
- Medication reconciliation across transitions
- No missed handoffs, no lost medication changes

---

## User Roles

| Role | Description | Primary Access |
|------|-------------|----------------|
| `patient` | Core user (called "Member" in UI) | /home |
| `caregiver` | Family with delegated access | /family/dashboard |
| `provider` | Healthcare provider (marketplace) | /provider/dashboard |
| `care_team` | Nurse, MA, care coordinator | /care-team/inbox |
| `clinic_admin` | Practice administrator | /clinic/dashboard |
| `inpatient_team` | Hospital team (temp access) | /hospital/patients |
| `admin` | Platform administrator | /admin |

---

## Provider Relationship Types

| Type | Duration | Use Case | Features |
|------|----------|----------|----------|
| `none` | N/A | Self-tracking only | Wellness mode only |
| `one_off` | Single visit | Acute need, second opinion | Message during consult |
| `temporary` | Days to weeks | Post-op, acute illness | Message, appointments, refills |
| `permanent` | Ongoing | Primary care relationship | Full features, care continuity |

---

## Revenue Model

### For Providers (Marketplace Listings)
| Tier | Price | Features |
|------|-------|----------|
| Basic | Free | Listed in search |
| Featured | $99/mo | Highlighted, badge, priority |
| Premium | $299/mo | Top placement, analytics, leads |

### For Clinics (Engagement Tools)
- Per-patient subscription for engagement tools
- Translation API usage (per-character or bundled)
- Care continuity features (ADT integration)

---

## Technical Architecture

### Translation Stack
- **Voice Input:** Whisper API (OpenAI) - 99 languages
- **Translation:** Google Cloud Translation API - 128+ languages
- **Medical Glossary:** Custom terminology layer
- **Text-to-Speech:** Google Cloud TTS

### Care Continuity Stack
- **ADT Integration:** Redox or Health Gorilla
- **Handoff Protocol:** Patient-controlled sharing (HIPAA compliant)
- **Real-time Alerts:** WebSocket + Push notifications

### Core Stack
- **Frontend:** React Native / Next.js PWA
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **AI:** Claude API for health assistant
- **Voice:** Whisper API for transcription

---

## MVP Priority

1. **Voice logging + language detection** (Pillars 1+2)
2. **Patient-provider messaging with auto-translation** (Pillar 2)
3. **Wellness tracking** (meds, vitals, labs)
4. **Care status + admission alerts** (Pillar 4)
5. **Provider marketplace** (Pillar 3)

Ship 1+2+3 first. That's already award-winning.

---

*Last Updated: January 9, 2026*
