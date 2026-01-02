# Dynamic MD Recipient Implementation

## ✅ Replaced Hardcoded "Dr. Smith" with Dynamic Primary MD Lookup

### Problem
The recipient list had a hardcoded "Dr. Smith" entry, but it should dynamically show whichever MD is the owner of the patient's mailbox (their primary care physician).

### Solution

#### 1. Created `getPrimaryClinician()` Function
**Location:** `lib/supabase/queries.ts`

```typescript
export async function getPrimaryClinician(patientId: string) {
  // Gets patient's primary_clinician_id
  // Fetches clinician details from clinicians table
  // Returns: { id, firstName, lastName, title, displayName }
}
```

#### 2. Updated Recipients List
**Location:** `app/messages/new/page.tsx`

- Recipients list now loads dynamically
- Primary MD is fetched from patient's `primary_clinician_id`
- MD recipient ID format: `md-{clinicianId}` (e.g., `md-abc123`)
- Display name shows actual MD name: "Dr. John Doe" or "MD Jane Smith"

#### 3. Updated Message Routing
**Location:** `lib/api/message-helpers.ts`

- Recognizes `md-{clinicianId}` format
- Maps to `clinical` category for routing
- Solopractice receives the clinician ID for proper mailbox assignment

#### 4. Updated Message Detail Page
**Location:** `app/messages/[id]/page.tsx`

- Loads thread subject dynamically
- Shows actual primary MD name instead of "Dr. Smith"
- Falls back to "Care Team" if MD not found

## 🔄 Flow

```
Patient opens message form
    ↓
MHA loads patient's primary_clinician_id
    ↓
Fetches clinician details (name, title)
    ↓
Adds to recipients list: "Dr. John Doe - Your primary care physician"
    ↓
Recipient ID: "md-{clinicianId}"
    ↓
When message sent, Solopractice receives:
  - recipient: "md-{clinicianId}"
  - category: "clinical"
    ↓
Solopractice routes to that MD's mailbox ✅
```

## 📋 Recipient Format

| Recipient Type | ID Format | Example |
|---------------|-----------|---------|
| Care Team | `care-team` | `care-team` |
| Primary MD | `md-{clinicianId}` | `md-abc123-def456` |
| Nursing Staff | `nurse` | `nurse` |
| Billing | `billing` | `billing` |
| Scheduling | `scheduling` | `scheduling` |

## ✅ Implementation Details

### Database Query
- Uses `patients.primary_clinician_id` to find the MD
- Joins with `clinicians` table to get name and title
- Returns formatted display name: `"{title} {firstName} {lastName}"`

### Fallback Behavior
- If patient has no `primary_clinician_id`: MD option not shown
- If clinician lookup fails: Falls back to "Care Team"
- If clinician not found: Recipient list shows without MD option

### Display
- Shows actual MD name: "Dr. John Doe" or "MD Jane Smith"
- Description: "Your primary care physician"
- Only shown if patient has a primary clinician assigned

## ✅ Status: COMPLETE

The hardcoded "Dr. Smith" has been replaced with dynamic lookup of the patient's primary MD. Messages are now routed to the correct MD's mailbox based on the patient's `primary_clinician_id`.

