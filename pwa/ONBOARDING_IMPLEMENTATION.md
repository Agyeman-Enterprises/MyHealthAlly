# Onboarding Flow Implementation

## Overview

Improved care team selection flow that prompts users to select their practice immediately after first login, replacing the clunky manual connect flow.

## ✅ Implementation

### Flow

1. **User Signs Up**
   - Creates patient record with `attachment_status: 'UNATTACHED'`
   - Redirects to email verification

2. **User Verifies Email**
   - Redirects to `/dashboard`

3. **Dashboard Checks Attachment**
   - If unattached → redirects to `/onboarding/select-practice`
   - If attached → shows dashboard

4. **Onboarding Page**
   - User selects from:
     - **Predefined Practices:**
       - Ohimaa GU Functional Medicine
       - MedRx
       - BookADoc2U
     - **Custom Care Team:**
       - Enter practice ID and practice name manually

5. **After Selection**
   - Attaches user to practice
   - Redirects to dashboard
   - Full app access unlocked

---

## Files Created/Modified

### New Files

1. **`pwa/app/onboarding/select-practice/page.tsx`**
   - Main onboarding page
   - Shows practice selection options
   - Handles predefined and custom practice attachment
   - Redirects to dashboard after successful attachment

2. **`pwa/app/connect/bookadoc2u/page.tsx`**
   - Connection page for BookADoc2U practice
   - Consistent with Ohimaa and MedRx pages

### Modified Files

1. **`pwa/app/dashboard/page.tsx`**
   - Added attachment status check on mount
   - Redirects unattached users to `/onboarding/select-practice`
   - Only shows dashboard if user is attached

2. **`pwa/lib/attachPractice.ts`**
   - Added `BOOKADOC2U` to source type union

3. **`pwa/app/connect/page.tsx`**
   - Added BookADoc2U option to connect page

---

## User Experience

### For New Users

1. Sign up → Verify email → Redirected to onboarding
2. See clear options:
   - Three predefined practices (Ohimaa, MedRx, BookADoc2U)
   - Custom care team option
3. Select practice → Automatically attached → Full app access

### For Existing Users

- If already attached: Normal dashboard access
- If unattached: Redirected to onboarding on next login

---

## Practice Selection Options

### Predefined Practices

1. **Ohimaa GU Functional Medicine**
   - Practice ID: `ohimaa-practice-id`
   - Source: `OHIMAA`
   - Description: Primary care and functional medicine

2. **MedRx**
   - Practice ID: `medrx-practice-id`
   - Source: `MEDRX`
   - Description: Pharmacy and medication management

3. **BookADoc2U**
   - Practice ID: `bookadoc2u-practice-id`
   - Source: `BOOKADOC2U`
   - Description: Healthcare services and appointments

### Custom Care Team

- User enters:
  - Practice ID (required)
  - Practice Name (required)
- Source: `OTHER`
- Allows connection to any designated care team

---

## Technical Details

### Attachment Check

The dashboard uses `getCurrentUserAndPatient()` to check:
- `patient.attachment_status === 'ATTACHED'`
- `patient.practice_id` is not null

If either condition fails, user is redirected to onboarding.

### Practice Attachment

All practice attachments use the centralized `attachPractice()` function:
- Updates patient record in database
- Creates SP patient if needed
- Sets `attachment_status = 'ATTACHED'`
- Stores `practice_id` and `sp_patient_id`

---

## Benefits

1. **Better UX**: Users are prompted immediately to select their care team
2. **Clearer Flow**: No confusion about when/how to connect
3. **Faster Onboarding**: One-step process instead of navigating to connect page
4. **Flexible**: Supports both predefined and custom practices
5. **Consistent**: All practices use same attachment mechanism

---

## Future Enhancements

1. **Practice Discovery**: Search/browse available practices
2. **Invite Codes**: Support for practice-specific invite codes during onboarding
3. **Practice Switching**: Allow users to switch practices in settings
4. **Practice Information**: Show more details about each practice before selection
