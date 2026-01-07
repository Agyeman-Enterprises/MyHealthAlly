# Practice Marketplace Implementation

## Overview

Implemented a practice marketplace system where:
1. **Practices can register** to be listed in the app
2. **Patients can select** from registered practices during onboarding
3. **Patients can bring their own practice** (custom practice ID)
4. **Admin approval** required for practice listings

This enables MyHealthAlly to be sold as a commercial product where practices sign up to offer their services to patients.

---

## Architecture

### Database Schema

**`practices` Table:**
- `id` (UUID) - Internal primary key
- `practice_id` (VARCHAR, unique) - External practice identifier (e.g., from EHR system)
- `name`, `description`, `specialty` - Practice information
- `status` - pending, approved, active, inactive, suspended
- `is_public` - Whether practice is visible to all patients
- `is_featured` - Featured practices shown first
- `is_predefined` - Predefined practices (Ohimaa, MedRx, BookADoc2U)
- `registered_by_user_id` - User who registered
- `approved_by_user_id` - Admin who approved
- `patient_count` - Auto-updated count of attached patients

**`patients.practice_id`:**
- Changed to VARCHAR(255) to store practice_id string
- Can reference `practices.practice_id` OR be a custom practice ID
- Supports both registered and custom practices

---

## User Flows

### 1. Practice Registration Flow

**Path:** `/practices/register`

1. Practice representative fills out registration form
2. Submits practice information:
   - Practice ID (unique identifier)
   - Name, description, specialty
   - Contact information
   - Address (optional)
3. Status set to `pending`
4. Admin reviews and approves
5. Practice becomes available for patient selection

### 2. Patient Onboarding Flow

**Path:** `/onboarding/select-practice`

1. Patient sees three categories:
   - **Featured Practices**: Ohimaa, MedRx, BookADoc2U (predefined)
   - **Available Practices**: Registered practices from database (approved, public)
   - **Other Options**: 
     - Custom Care Team (enter practice ID manually)
     - Register Your Practice (link to registration)

2. Patient selects a practice:
   - Predefined: Uses hardcoded practice_id
   - Registered: Uses practice_id from database
   - Custom: Uses entered practice_id

3. System attaches patient to practice
4. Patient gains full app access

### 3. Admin Management Flow

**Path:** `/admin/practices`

1. Admin views all practice registrations
2. Filters by status (all, pending, approved, active)
3. Approves or rejects pending practices
4. Views practice details and patient counts

---

## Implementation Details

### Practice ID Resolution

The `attachPractice()` function handles three types of practice IDs:

1. **Predefined Practices**: Hardcoded practice_id strings
   - `ohimaa-practice-id`
   - `medrx-practice-id`
   - `bookadoc2u-practice-id`

2. **Registered Practices**: UUID from practices table
   - System looks up practice by UUID
   - Gets `practice_id` string from database
   - Verifies status is 'approved'
   - Uses `practice_id` string for attachment

3. **Custom Practices**: User-entered practice_id string
   - Used as-is (no validation)
   - Stored directly in `patients.practice_id`

### Practice Status Workflow

```
pending → approved → active
         ↓
      inactive (rejected)
```

- **pending**: Newly registered, awaiting admin approval
- **approved**: Admin approved, visible to patients
- **active**: Currently active (same as approved, but can be used for future features)
- **inactive**: Rejected or deactivated
- **suspended**: Temporarily suspended

---

## Files Created/Modified

### New Files

1. **`pwa/supabase/migrations/014_practices_marketplace.sql`**
   - Creates `practices` table
   - Updates `patients.practice_id` to VARCHAR
   - Inserts predefined practices
   - Creates triggers for patient count updates
   - RLS policies for security

2. **`pwa/app/practices/register/page.tsx`**
   - Practice registration form
   - Validates practice ID uniqueness
   - Submits registration with pending status

3. **`pwa/app/admin/practices/page.tsx`**
   - Admin interface for practice management
   - View, approve, reject practices
   - Filter by status
   - View patient counts

### Modified Files

1. **`pwa/app/onboarding/select-practice/page.tsx`**
   - Loads registered practices from database
   - Displays featured and registered practices
   - Handles practice selection for all types
   - Links to practice registration

2. **`pwa/lib/attachPractice.ts`**
   - Added `REGISTERED` to source type
   - Practice ID resolution logic (UUID → practice_id string)
   - Verifies practice approval status

---

## Practice Registration Form Fields

- **Practice ID*** (unique, required)
- **Practice Name*** (required)
- **Description** (optional)
- **Specialty** (optional)
- **Phone** (optional)
- **Email** (optional)
- **Website** (optional)
- **Address** (optional)

---

## Admin Features

### Practice Management

- View all practices
- Filter by status
- Approve pending practices
- Reject practices
- View patient counts
- See registration/approval dates

### Practice Information Displayed

- Practice name and ID
- Description and specialty
- Status and visibility
- Patient count
- Registration date
- Approval date (if approved)

---

## Security & Access Control

### RLS Policies

1. **Public Access**: Anyone can view approved, public practices
2. **Admin Access**: Admins can view and manage all practices
3. **Registrant Access**: Practice registrants can view their own practice
4. **Registration**: Users can register new practices (status = pending)

### Practice Approval

- All registrations start as `pending`
- Only admins can approve
- Approved practices become visible to patients
- Rejected practices set to `inactive`

---

## Patient Count Tracking

Automatic trigger updates `practices.patient_count` when:
- Patient attaches to practice
- Patient changes practice
- Patient attachment status changes
- Patient record deleted

---

## Predefined Practices

Three predefined practices are automatically inserted:
1. **Ohimaa GU Functional Medicine** (`ohimaa-practice-id`)
2. **MedRx** (`medrx-practice-id`)
3. **BookADoc2U** (`bookadoc2u-practice-id`)

These are:
- `is_predefined: true`
- `is_featured: true`
- `status: approved`
- Always visible to patients

---

## Future Enhancements

1. **Practice Profiles**: Detailed practice pages with services, providers, etc.
2. **Practice Search**: Search and filter practices by specialty, location, etc.
3. **Practice Verification**: Additional verification steps for practices
4. **Practice Analytics**: Dashboard for practices to see their patient engagement
5. **Practice Settings**: Practices can update their own information
6. **Practice Invites**: Practices can invite patients directly
7. **Multi-location Support**: Practices with multiple locations

---

## Testing

### Test Scenarios

1. **Practice Registration**
   - Register a new practice
   - Verify it appears as pending
   - Admin approves it
   - Verify it appears in patient onboarding

2. **Patient Selection**
   - Select predefined practice → Should attach
   - Select registered practice → Should attach
   - Enter custom practice ID → Should attach

3. **Admin Management**
   - View pending practices
   - Approve practice
   - Verify patient count updates

---

## Migration Notes

**Important:** The migration changes `patients.practice_id` from UUID to VARCHAR(255).

If you have existing data:
- Existing UUID practice_ids will need to be migrated
- Or you can keep them as custom practice IDs
- New attachments will use string practice_ids
