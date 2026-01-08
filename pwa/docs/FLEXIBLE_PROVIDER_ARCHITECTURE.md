# Flexible Provider Relationship Architecture

## Problem Statement

**Current State (Too Restrictive):**
- Binary attachment model: UNATTACHED vs ATTACHED
- When UNATTACHED: Most features blocked by `RequirePractice` gates
- When ATTACHED: Locked to ONE practice permanently
- No support for:
  - Multiple provider relationships
  - One-off consultations
  - Temporary relationships
  - Flexible data sharing
  - Provider marketplace interactions

**Desired State (Flexible & User-Friendly):**
- Users can track everything themselves (wellness mode like BodySite)
- Optional provider relationships:
  - One-off consultations
  - Temporary relationships
  - Permanent relationships (favorite/make permanent)
- Flexible data sharing: push data to providers when needed
- Marketplace where providers hang virtual shingles
- Users can switch providers or have multiple providers

---

## New Architecture Design

### Core Principle: **Wellness-First, Provider-Optional**

The app should work fully in wellness mode. Provider relationships are **additive**, not **required**.

---

## Database Schema Changes

### 1. New Table: `patient_provider_relationships`

```sql
CREATE TABLE patient_provider_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  practice_id VARCHAR(255), -- Can be null for marketplace providers
  
  -- Relationship Type
  relationship_type VARCHAR(50) NOT NULL DEFAULT 'temporary',
  -- Values: 'one_off', 'temporary', 'permanent', 'favorite'
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  -- Values: 'active', 'inactive', 'ended'
  
  -- Data Sharing Permissions
  share_medications BOOLEAN DEFAULT false,
  share_labs BOOLEAN DEFAULT false,
  share_vitals BOOLEAN DEFAULT false,
  share_medical_history BOOLEAN DEFAULT false,
  share_care_plans BOOLEAN DEFAULT false,
  share_all_data BOOLEAN DEFAULT false, -- Master switch
  
  -- Relationship Metadata
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT, -- Patient notes about this provider
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ NULL,
  last_interaction_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(patient_id, provider_id, practice_id) -- One relationship per provider per practice
);

CREATE INDEX idx_ppr_patient ON patient_provider_relationships(patient_id);
CREATE INDEX idx_ppr_provider ON patient_provider_relationships(provider_id);
CREATE INDEX idx_ppr_status ON patient_provider_relationships(status) WHERE status = 'active';
```

### 2. Modify `patients` Table

**Remove binary attachment model:**
- Keep `practice_id` for backward compatibility (primary/default practice)
- Keep `attachment_status` for backward compatibility
- **Add new fields:**
  - `default_provider_id` UUID (favorite/permanent provider)
  - `wellness_mode_enabled` BOOLEAN DEFAULT true (always allow self-tracking)

### 3. New Table: `provider_marketplace_listings`

```sql
CREATE TABLE provider_marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES clinicians(id),
  practice_id VARCHAR(255),
  
  -- Listing Info
  title VARCHAR(255) NOT NULL, -- e.g., "Dr. Smith - Virtual Consultations"
  description TEXT,
  specialties TEXT[], -- Array of specialties
  consultation_types TEXT[], -- ['one_off', 'ongoing', 'both']
  
  -- Availability
  is_accepting_new_patients BOOLEAN DEFAULT true,
  virtual_consultations BOOLEAN DEFAULT true,
  in_person BOOLEAN DEFAULT false,
  
  -- Pricing (optional)
  consultation_fee DECIMAL(10,2),
  accepts_insurance BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  rating DECIMAL(3,2), -- Average rating
  review_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. New Table: `data_sharing_requests`

```sql
CREATE TABLE data_sharing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES clinicians(id),
  relationship_id UUID REFERENCES patient_provider_relationships(id),
  
  -- What to share
  share_type VARCHAR(50) NOT NULL, -- 'medications', 'labs', 'vitals', 'all', 'custom'
  data_snapshot JSONB, -- Snapshot of data being shared
  
  -- Request Type
  request_type VARCHAR(50) NOT NULL DEFAULT 'one_off',
  -- Values: 'one_off', 'ongoing', 'permanent'
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'approved', 'rejected', 'expired'
  
  -- Dates
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NULL, -- For one-off shares
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Relationship Types Explained

### 1. **One-Off** (`one_off`)
- Single consultation/interaction
- Data sharing expires after consultation
- No ongoing relationship
- Example: "I need a second opinion on this lab result"

### 2. **Temporary** (`temporary`)
- Short-term relationship (e.g., 30-90 days)
- Data sharing for limited time
- Auto-expires after period
- Example: "Help me with this acute issue"

### 3. **Permanent** (`permanent`)
- Long-term relationship
- Ongoing data sharing
- Provider can see calendar, book appointments
- Example: "This is my primary care provider"

### 4. **Favorite** (`favorite`)
- Marked as favorite for easy access
- Can be temporary or permanent
- Shows up in "My Providers" list
- Example: "I like this provider, want to see them again"

---

## Feature Access Model

### Wellness Mode (Default - Always Available)

**Users can ALWAYS:**
- ✅ Enter medications
- ✅ Enter labs/test results
- ✅ Track vitals
- ✅ Create care plans
- ✅ View medical history
- ✅ Track symptoms
- ✅ Use AI assistant
- ✅ Access education resources

**No gates, no restrictions.** This is like BodySite - full wellness tracking.

### Provider Features (Additive)

**When user has provider relationships:**
- ✅ Share data with providers (on-demand)
- ✅ Message providers
- ✅ Request appointments
- ✅ Request refills
- ✅ Get provider-verified data

**These features are OPTIONAL and ADDITIVE**, not required.

---

## User Flows

### Flow 1: Wellness-Only User

1. User downloads app
2. Creates account
3. **Immediately** can:
   - Enter medications
   - Track vitals
   - Enter labs
   - Create care plans
   - Use all wellness features
4. Never connects to provider
5. **App is fully functional** - like BodySite

### Flow 2: One-Off Consultation

1. User has been tracking data in wellness mode
2. User finds provider in marketplace
3. User books one-off consultation
4. User **chooses** to share:
   - "Share my medications for this visit"
   - "Share my recent labs"
   - "Share my vitals from last month"
5. Provider sees shared data during consultation
6. After consultation, relationship ends (or user can make it permanent)

### Flow 3: Temporary Relationship

1. User finds provider in marketplace
2. User starts temporary relationship (30-90 days)
3. User sets data sharing preferences:
   - "Share medications: Yes"
   - "Share labs: Yes"
   - "Share vitals: No"
4. Provider can see shared data during relationship
5. Relationship auto-expires or user ends it

### Flow 4: Make Provider Permanent

1. User has temporary relationship with provider
2. User likes provider, clicks "Make Permanent" or "Favorite"
3. Relationship converts to permanent
4. Provider becomes default provider
5. Provider can:
   - See ongoing shared data
   - Show calendar for booking
   - Send messages
   - Request refills

### Flow 5: Multiple Providers

1. User has permanent provider (Primary Care)
2. User finds specialist in marketplace
3. User starts temporary relationship with specialist
4. User shares only relevant data with specialist
5. User can have multiple active relationships
6. Each relationship has its own data sharing settings

---

## UI/UX Changes

### Remove `RequirePractice` Gates

**Remove from:**
- `/medications` ✅ (Already done)
- `/labs` - Allow entry, show "share with provider" button
- `/vitals` - Already works, but add "share" option
- `/care-plan` - Allow creation, add "share" option
- `/messages` - Show "Find Provider" if no relationships
- `/appointments` - Show marketplace if no relationships

### Add "Share with Provider" Actions

**Every data entry should have:**
- "Save" button (saves to personal wellness tracking)
- "Save & Share with Provider" button (if relationships exist)
- "Share Later" option (save now, share later)

### Provider Marketplace

**New routes:**
- `/providers` - Browse marketplace
- `/providers/[id]` - Provider profile
- `/providers/[id]/book` - Book consultation
- `/my-providers` - Manage relationships

### Relationship Management

**New routes:**
- `/my-providers` - List all relationships
- `/my-providers/[id]` - Manage specific relationship
  - Edit data sharing permissions
  - Make permanent/favorite
  - End relationship

---

## Data Sharing Model

### On-Demand Sharing

**User initiates:**
- "Share my medications with Dr. Smith"
- "Share my labs from last month"
- "Share my vitals for this consultation"

**Implementation:**
- Creates `data_sharing_request` record
- Pushes data snapshot to provider
- Provider sees data in their dashboard
- Data expires based on relationship type

### Ongoing Sharing

**User sets preferences:**
- "Always share medications with permanent providers"
- "Share labs when requested"
- "Never share vitals automatically"

**Implementation:**
- Stored in `patient_provider_relationships`
- Auto-syncs data based on permissions
- User can change anytime

---

## Migration Strategy

### Phase 1: Enable Wellness Mode (Immediate)

1. Remove `RequirePractice` from wellness features
2. Allow all self-tracking features
3. Add "Wellness Mode" banners
4. **No database changes needed yet**

### Phase 2: Add Relationship Tables

1. Create `patient_provider_relationships` table
2. Create `provider_marketplace_listings` table
3. Create `data_sharing_requests` table
4. Migrate existing attachments to relationships

### Phase 3: Build Marketplace

1. Provider registration/listing
2. Provider profiles
3. Booking system
4. Relationship management UI

### Phase 4: Data Sharing

1. "Share with Provider" buttons
2. Data sharing preferences
3. Provider dashboard integration

---

## Key Principles

1. **Wellness-First**: App works fully without providers
2. **Provider-Optional**: Relationships are additive, not required
3. **User Control**: Users control what data to share, when, and with whom
4. **Flexible Relationships**: Support one-off, temporary, permanent
5. **Multiple Providers**: Users can have multiple relationships
6. **Easy Switching**: Users can end relationships and start new ones

---

## Benefits

1. **User Value**: App is useful immediately, even without providers
2. **Market Expansion**: Can serve users who don't want provider relationships
3. **Provider Flexibility**: Supports various care models (one-off, ongoing, etc.)
4. **Competitive**: Matches BodySite wellness tracking + adds provider marketplace
5. **Revenue**: Can charge for wellness features + provider marketplace transactions

---

## Next Steps

1. **Immediate**: Remove remaining `RequirePractice` gates from wellness features
2. **Short-term**: Create relationship tables and migration
3. **Medium-term**: Build marketplace and relationship management
4. **Long-term**: Full data sharing system
