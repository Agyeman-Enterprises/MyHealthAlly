# Practice Marketplace - Implementation Guide

## Overview

MyHealthAlly now supports a **practice marketplace model** where:
- **Practices can register** to be listed in the app
- **Patients can select** from registered practices during onboarding
- **Patients can bring their own practice** (custom practice ID)
- **Admin approval** required for practice listings

This enables MyHealthAlly to be sold as a commercial product where practices sign up to offer their services to patients.

---

## How It Works

### For Practices

1. **Practice Registration** (`/practices/register`)
   - Practice representative fills out registration form
   - Provides practice ID, name, description, contact info
   - Status set to `pending`
   - Admin reviews and approves

2. **After Approval**
   - Practice appears in patient onboarding
   - Patients can select the practice
   - Practice gains access to attached patients

### For Patients

1. **Onboarding** (`/onboarding/select-practice`)
   - See three categories:
     - **Featured Practices**: Ohimaa, MedRx, BookADoc2U
     - **Available Practices**: Registered practices from database
     - **Other Options**: Custom practice or register new practice

2. **Selection**
   - Click on a practice → Attached automatically
   - Or enter custom practice ID → Attached with custom ID
   - Full app access unlocked

### For Admins

1. **Practice Management** (`/admin/practices`)
   - View all practice registrations
   - Filter by status (pending, approved, etc.)
   - Approve or reject practices
   - View patient counts

---

## Database Structure

### `practices` Table

```sql
- id (UUID) - Primary key
- practice_id (VARCHAR, unique) - External practice identifier
- name, description, specialty
- status (pending, approved, active, inactive, suspended)
- is_public, is_featured, is_predefined
- registered_by_user_id, approved_by_user_id
- patient_count (auto-updated)
```

### `patients.practice_id`

- **Type**: VARCHAR(255)
- **Stores**: Practice ID string (not UUID)
- **Can be**:
  - `practices.practice_id` (for registered practices)
  - Custom practice ID (for patient's own practice)
  - Predefined practice ID (ohimaa-practice-id, etc.)

---

## Practice ID Resolution Flow

When a patient selects a practice:

1. **Predefined Practice** (Ohimaa, MedRx, BookADoc2U)
   - Uses hardcoded `practice_id` string
   - Stored directly in `patients.practice_id`

2. **Registered Practice** (from database)
   - Patient selects practice → Gets `practices.id` (UUID)
   - `attachPractice()` receives UUID
   - Looks up practice in database
   - Gets `practices.practice_id` (string)
   - Verifies status is 'approved'
   - Stores `practice_id` string in `patients.practice_id`

3. **Custom Practice** (patient's own)
   - Patient enters practice ID string
   - Stored directly in `patients.practice_id`
   - No validation (allows any practice ID)

---

## Practice Status Workflow

```
Registration → pending → [Admin Review] → approved → active
                              ↓
                          inactive (rejected)
```

- **pending**: Newly registered, awaiting approval
- **approved**: Admin approved, visible to patients
- **active**: Currently active (synonym for approved)
- **inactive**: Rejected or deactivated
- **suspended**: Temporarily suspended

---

## Files Overview

### Database
- `014_practices_marketplace.sql` - Creates practices table and updates schema

### Pages
- `/practices/register` - Practice registration form
- `/onboarding/select-practice` - Patient practice selection (updated)
- `/admin/practices` - Admin practice management

### Services
- `attachPractice()` - Updated to handle UUID → practice_id resolution

---

## Usage Examples

### Register a New Practice

1. Navigate to `/practices/register`
2. Fill out form:
   - Practice ID: `acme-medical-center-001`
   - Name: `Acme Medical Center`
   - Specialty: `Primary Care`
3. Submit → Status: `pending`
4. Admin approves → Status: `approved`
5. Practice appears in patient onboarding

### Patient Selects Practice

1. Patient goes through onboarding
2. Sees "Acme Medical Center" in "Available Practices"
3. Clicks on it
4. System:
   - Gets practice UUID
   - Resolves to `practice_id: "acme-medical-center-001"`
   - Attaches patient
   - Stores `practice_id` in `patients.practice_id`

### Patient Brings Own Practice

1. Patient selects "Custom Care Team"
2. Enters:
   - Practice ID: `my-doctor-practice-123`
   - Practice Name: `My Doctor's Practice`
3. System stores custom practice ID directly
4. No validation or lookup required

---

## Security

- **RLS Policies**: 
  - Public can view approved, public practices
  - Admins can manage all practices
  - Registrants can view their own practice

- **Approval Required**: All registrations require admin approval

- **Status Verification**: System verifies practice is approved before attachment

---

## Future Enhancements

1. **Practice Profiles**: Detailed pages with services, providers, locations
2. **Practice Search**: Search by specialty, location, services
3. **Practice Verification**: Additional verification steps
4. **Practice Analytics**: Dashboard for practices
5. **Practice Self-Service**: Practices can update their own info
6. **Practice Invites**: Direct patient invitations
7. **Multi-location**: Support for practices with multiple locations
