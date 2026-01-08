# Wellness-First Implementation Plan

## Executive Summary

**Current Problem:** App is too restrictive - users can't do anything useful without connecting to a care team. This makes the app worthless for $65/month.

**Solution:** Transform to **Wellness-First, Provider-Optional** architecture where:
1. App works fully for self-tracking (like BodySite)
2. Provider relationships are **additive**, not **required**
3. Users can have flexible relationships (one-off, temporary, permanent)
4. Data sharing is **user-controlled** and **on-demand**

---

## Architecture Overview

### Current (Restrictive) Model
```
User → Must Attach to Practice → Can Use Features
     ↓
If Not Attached → BLOCKED by RequirePractice gates
```

### New (Flexible) Model
```
User → Wellness Mode (Always Available)
     ↓
     ├─→ Self-Tracking (meds, labs, vitals, care plans)
     ├─→ Optional: Find Provider in Marketplace
     ├─→ Optional: One-Off Consultation
     ├─→ Optional: Temporary Relationship
     └─→ Optional: Make Provider Permanent
```

---

## Core Data Model

### 1. Patient-Provider Relationships (Many-to-Many)

**Key Insight:** Users can have MULTIPLE provider relationships, each with different permissions.

```typescript
interface PatientProviderRelationship {
  id: string;
  patient_id: string;
  provider_id: string;
  practice_id?: string; // Optional - for marketplace providers
  
  relationship_type: 'one_off' | 'temporary' | 'permanent' | 'favorite';
  status: 'active' | 'inactive' | 'ended';
  
  // Granular data sharing permissions
  share_medications: boolean;
  share_labs: boolean;
  share_vitals: boolean;
  share_medical_history: boolean;
  share_care_plans: boolean;
  share_all_data: boolean; // Master switch
  
  is_favorite: boolean;
  started_at: Date;
  ended_at?: Date;
}
```

### 2. Data Sharing Requests (On-Demand)

**Key Insight:** Users can push data to providers when needed, not automatically.

```typescript
interface DataSharingRequest {
  id: string;
  patient_id: string;
  provider_id: string;
  relationship_id?: string;
  
  share_type: 'medications' | 'labs' | 'vitals' | 'all' | 'custom';
  data_snapshot: JSON; // What was shared
  
  request_type: 'one_off' | 'ongoing' | 'permanent';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  
  requested_at: Date;
  expires_at?: Date; // For one-off shares
}
```

### 3. Provider Marketplace Listings

**Key Insight:** Providers can "hang their virtual shingle" in the marketplace.

```typescript
interface ProviderMarketplaceListing {
  id: string;
  provider_id: string;
  practice_id?: string;
  
  title: string; // "Dr. Smith - Virtual Consultations"
  description: string;
  specialties: string[];
  consultation_types: ('one_off' | 'ongoing' | 'both')[];
  
  is_accepting_new_patients: boolean;
  virtual_consultations: boolean;
  in_person: boolean;
  
  consultation_fee?: number;
  accepts_insurance: boolean;
  
  status: 'active' | 'inactive' | 'suspended';
  is_featured: boolean;
  rating?: number;
  review_count: number;
}
```

---

## User Workflows

### Workflow 1: Pure Wellness User (No Providers)

**Steps:**
1. User downloads app
2. Creates account
3. **Immediately** can:
   - Enter medications ✅
   - Track vitals ✅
   - Enter lab results ✅
   - Create care plans ✅
   - View medical history ✅
   - Use AI assistant ✅
4. Never connects to provider
5. **App is fully functional** - like BodySite

**Value Proposition:** "Track your health like BodySite, plus get optional provider access when you need it"

### Workflow 2: One-Off Consultation

**Steps:**
1. User has been tracking data in wellness mode
2. User finds provider in marketplace: `/providers`
3. User views provider profile: `/providers/[id]`
4. User books one-off consultation: `/providers/[id]/book`
5. **During booking, user chooses what to share:**
   - ☑️ Share my medications
   - ☑️ Share my recent labs (last 3 months)
   - ☐ Share my vitals
   - ☐ Share my medical history
6. Consultation happens
7. **After consultation:**
   - Relationship auto-ends (one-off)
   - OR user can click "Make Permanent" or "Favorite"
   - OR user can extend to temporary relationship

**Key Feature:** User controls what data to share, when

### Workflow 3: Temporary Relationship

**Steps:**
1. User finds provider in marketplace
2. User starts temporary relationship (30-90 days)
3. **User sets data sharing preferences:**
   - Medications: Share ongoing ✅
   - Labs: Share when requested ⚠️
   - Vitals: Don't share ❌
   - Medical history: Share ongoing ✅
4. Provider can see shared data during relationship
5. **Relationship management:**
   - User can change permissions anytime
   - User can end relationship early
   - User can make permanent before expiration
   - Auto-expires after period

**Key Feature:** Flexible, time-limited relationships

### Workflow 4: Make Provider Permanent

**Steps:**
1. User has temporary relationship with provider
2. User likes provider, clicks "Make Permanent" or "Favorite"
3. Relationship converts to permanent
4. Provider becomes default provider
5. **Provider gains additional access:**
   - Can see ongoing shared data
   - Can show calendar for booking
   - Can send messages
   - Can request refills
   - Can create care plans
6. User can still have other relationships (specialists, etc.)

**Key Feature:** Users can "promote" providers they like

### Workflow 5: Multiple Providers

**Steps:**
1. User has permanent provider (Primary Care - Dr. Smith)
   - Shares: All data
   - Relationship: Permanent
2. User finds specialist in marketplace (Cardiologist - Dr. Jones)
3. User starts temporary relationship with specialist
4. **User shares only relevant data:**
   - Medications: Yes (cardiac meds)
   - Labs: Yes (cardiac labs only)
   - Vitals: Yes (heart rate, BP)
   - Medical history: No (not relevant)
5. User can manage both relationships separately
6. Each provider only sees what user shares with them

**Key Feature:** Multiple relationships with granular permissions

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

## Implementation Phases

### Phase 1: Remove Restrictions (IMMEDIATE - This Week)

**Goal:** Make app useful without providers

**Tasks:**
1. ✅ Remove `RequirePractice` from `/medications` (DONE)
2. Remove `RequirePractice` from `/labs`
3. Remove `RequirePractice` from `/care-plan`
4. Remove `RequirePractice` from `/vitals` (already works, verify)
5. Add "Wellness Mode" banners to all pages
6. Update messaging: "For personal tracking" vs "Shared with provider"

**Impact:** App becomes immediately useful for $65/month

### Phase 2: Database Schema (Next Week)

**Goal:** Support flexible relationships

**Tasks:**
1. Create `patient_provider_relationships` table
2. Create `provider_marketplace_listings` table
3. Create `data_sharing_requests` table
4. Migrate existing attachments to relationships
5. Update `patients` table (add `wellness_mode_enabled`, `default_provider_id`)

**Impact:** Foundation for flexible relationships

### Phase 3: Provider Marketplace (2-3 Weeks)

**Goal:** Let providers list themselves

**Tasks:**
1. Provider registration form
2. Provider profile pages
3. Marketplace browse/search
4. Provider filtering (specialty, consultation type, etc.)
5. Booking system for consultations

**Impact:** Users can find and book providers

### Phase 4: Relationship Management (2-3 Weeks)

**Goal:** Let users manage provider relationships

**Tasks:**
1. "My Providers" page
2. Relationship detail page
3. Data sharing preferences UI
4. "Make Permanent" / "Favorite" actions
5. End relationship flow

**Impact:** Users have control over relationships

### Phase 5: Data Sharing System (3-4 Weeks)

**Goal:** On-demand and ongoing data sharing

**Tasks:**
1. "Share with Provider" buttons on all data entry
2. Data sharing request system
3. Provider dashboard to view shared data
4. Ongoing sync for permanent relationships
5. Data expiration for one-off/temporary

**Impact:** Users can share data when they want

---

## UI/UX Changes

### Remove Gates

**Before:**
```tsx
<RequirePractice featureName="Medications">
  <MedicationsPage />
</RequirePractice>
```

**After:**
```tsx
<MedicationsPage />
// Shows wellness mode banner if not attached
// Shows "Share with Provider" if relationships exist
```

### Add Wellness Mode Banners

**On every wellness page:**
```tsx
{!attached && (
  <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm">
    <strong>Wellness Mode:</strong> This is for your personal tracking.
    <Link href="/providers" className="ml-1 text-blue-600 underline">
      Find a provider
    </Link> to share with your care team.
  </div>
)}
```

### Add Share Actions

**On data entry forms:**
```tsx
<div className="flex gap-3">
  <Button onClick={handleSave}>Save</Button>
  {hasRelationships && (
    <Button onClick={handleSaveAndShare}>
      Save & Share with Provider
    </Button>
  )}
</div>
```

### Provider Marketplace

**New routes:**
- `/providers` - Browse marketplace
- `/providers/[id]` - Provider profile
- `/providers/[id]/book` - Book consultation
- `/my-providers` - Manage relationships

---

## Key Principles

1. **Wellness-First**: App works fully without providers
2. **Provider-Optional**: Relationships are additive, not required
3. **User Control**: Users control what data to share, when, and with whom
4. **Flexible Relationships**: Support one-off, temporary, permanent
5. **Multiple Providers**: Users can have multiple relationships
6. **Easy Switching**: Users can end relationships and start new ones

---

## Why This Architecture Works

### For Users
- ✅ App is useful immediately (like BodySite)
- ✅ No forced provider relationships
- ✅ Control over data sharing
- ✅ Can try providers without commitment
- ✅ Can have multiple providers for different needs

### For Providers
- ✅ Can list in marketplace
- ✅ Can accept one-off consultations
- ✅ Can build ongoing relationships
- ✅ Can see shared data (with permission)
- ✅ Can offer virtual consultations

### For Business
- ✅ App has value without providers ($65/month justified)
- ✅ Marketplace creates network effects
- ✅ Multiple revenue streams:
  - Subscription (wellness features)
  - Marketplace fees (provider listings)
  - Transaction fees (consultations)
- ✅ Competitive with BodySite + adds provider marketplace

---

## Migration Path

### Step 1: Immediate (This Week)
- Remove `RequirePractice` gates from wellness features
- Add wellness mode banners
- **Result:** App is immediately useful

### Step 2: Short-term (Next 2 Weeks)
- Create relationship tables
- Build basic marketplace
- **Result:** Users can find and connect to providers

### Step 3: Medium-term (Next Month)
- Relationship management UI
- Data sharing system
- **Result:** Full flexible relationship model

---

## Success Metrics

1. **User Engagement:**
   - % of users who use app without providers (target: 60%+)
   - % of users who add medications/labs/vitals (target: 80%+)
   - % of users who connect to providers (target: 40%+)

2. **Provider Marketplace:**
   - Number of providers in marketplace
   - Number of consultations booked
   - Provider retention rate

3. **Revenue:**
   - Subscription retention (should improve with useful app)
   - Marketplace revenue
   - Transaction fees

---

## Next Immediate Actions

1. **Remove `RequirePractice` from:**
   - `/labs` - Allow entry, show "share" option
   - `/care-plan` - Allow creation, show "share" option
   - Verify `/vitals` works (already should)

2. **Add wellness mode banners** to all wellness pages

3. **Update messaging** throughout app:
   - "For personal tracking" vs "Shared with provider"
   - "Connect to share" vs "Must connect"

4. **Create database migration** for relationship tables

This architecture transforms the app from "useless without providers" to "useful wellness app with optional provider marketplace" - which is what users expect for $65/month.
