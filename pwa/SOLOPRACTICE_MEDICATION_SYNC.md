# Solopractice Medication Sync - Implementation Summary

## ✅ What Was Implemented

### 1. Medication Webhook Endpoint (`app/api/patient/medications/route.ts`)
- **Endpoint**: `POST /api/patient/medications`
- **Authentication**: Uses `x-mha-signature` header with `INBOUND_WEBHOOK_SECRET`
- **Functionality**:
  - ✅ Validates webhook signature
  - ✅ Checks if patient is registered in MHA
  - ✅ Creates or updates medications based on Solopractice data
  - ✅ Handles medication discontinuation
  - ✅ Translates instructions to patient's preferred language
  - ✅ Calculates next refill due date based on `last_refill_date` and `days_supply`
  - ✅ Tracks refills remaining and total refills
  - ✅ Stores Solopractice medication ID for tracking

### 2. Refill Tracking Utilities (`lib/utils/medication-refills.ts`)
- **`calculateNextRefillDueDate()`**: Calculates when next refill is due
- **`calculateDaysUntilDue()`**: Calculates days until refill is due
- **`getRefillInfo()`**: Comprehensive refill information
- **`formatRefillStatus()`**: User-friendly refill status messages

### 3. Database Schema Updates
- **Migration**: `004_add_medication_refill_tracking.sql`
  - ✅ Added `days_supply` column to medications table
  - ✅ Added `next_refill_due_date` column to medications table
  - ✅ Added `solopractice_medication_id` column for tracking
  - ✅ Added indexes for efficient refill queries

### 4. Medications Page Updates (`app/medications/page.tsx`)
- ✅ Loads medications from database instead of mock data
- ✅ Displays active medications only
- ✅ Shows refill status with due dates
- ✅ Highlights medications that need refills
- ✅ Shows prescriber information
- ✅ Displays medication instructions

### 5. Medication Queries Updates (`lib/supabase/queries-medications.ts`)
- ✅ Extended `Medication` interface with all fields
- ✅ Updated query to order by active status first

## 🔌 Webhook Payload Format

Solopractice should send POST requests to `/api/patient/medications` with this payload:

```typescript
{
  // Required fields
  patient_id: string;
  name: string;
  dosage: string;
  dosage_unit: string; // e.g., "mg", "ml", "tablets"
  frequency: string; // e.g., "Once daily", "Twice daily"
  
  // Optional identification
  id?: string; // Solopractice medication ID
  solopractice_medication_id?: string; // Alternative field name
  
  // Optional medication details
  generic_name?: string;
  brand_name?: string;
  ndc_code?: string;
  route?: string; // e.g., "oral", "topical"
  schedule?: Record<string, unknown>;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  is_active?: boolean;
  is_prn?: boolean;
  
  // Refill tracking (REQUIRED for automatic tracking)
  refills_remaining?: number;
  refills_total?: number;
  last_refill_date?: string; // YYYY-MM-DD
  days_supply?: number; // Days supply for calculating next refill due date
  
  // Pharmacy information
  pharmacy?: string;
  pharmacy_phone?: string;
  pharmacy_address?: string;
  
  // Instructions
  instructions?: string; // Will be translated to patient's preferred language
  
  // Clinical information
  indication?: string;
  prescriber_id?: string;
  prescriber_name?: string;
  
  // Discontinuation
  action?: 'create' | 'update' | 'discontinue';
  discontinued_at?: string; // ISO timestamp
  discontinued_reason?: string;
}
```

## 📋 Refill Tracking Logic

### Automatic Calculation
When Solopractice sends a medication with:
- `last_refill_date`: Date of last refill
- `days_supply`: Number of days the prescription lasts

MHA automatically calculates:
- `next_refill_due_date`: `last_refill_date + days_supply`

### Display Logic
- **Refills remaining**: Shows count from `refills_remaining`
- **Due date**: Shows calculated `next_refill_due_date`
- **Status messages**:
  - "X refills remaining • Due in Y days"
  - "X refills remaining • Due today"
  - "X refills remaining • Due Y days ago"
  - "No refills remaining"

### Refill Alerts
Medications are flagged for refill when:
- `refills_remaining <= 1` OR
- `next_refill_due_date` is today or in the past

## 🔐 Security

- Webhook endpoint requires `x-mha-signature` header
- Signature must match `INBOUND_WEBHOOK_SECRET` environment variable
- Patient must be registered in MHA (checked before processing)
- All database operations use Supabase service with proper permissions

## 🔄 Medication Sync Flow

1. **Solopractice generates medication** → Sends webhook to MHA
2. **MHA validates** → Checks signature and patient registration
3. **MHA checks existing** → Looks for medication by patient_id + name + dosage
4. **MHA creates/updates** → Upserts medication in database
5. **MHA calculates refill date** → Computes `next_refill_due_date`
6. **MHA translates** → Translates instructions to patient's language
7. **MHA responds** → Returns success with medication ID

## 📊 Database Schema

### Medications Table (Updated)
```sql
medications (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  solopractice_medication_id VARCHAR(255), -- NEW: Track Solopractice ID
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  dosage_unit VARCHAR(50) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  refills_remaining INTEGER,
  last_refill_date DATE,
  days_supply INTEGER, -- NEW: For calculating next refill
  next_refill_due_date DATE, -- NEW: Calculated refill due date
  is_active BOOLEAN DEFAULT true,
  -- ... other fields
)
```

## 🚀 Deployment Checklist

Before deploying:

- [ ] Run migration `004_add_medication_refill_tracking.sql` on Supabase
- [ ] Verify `INBOUND_WEBHOOK_SECRET` is set in environment
- [ ] Configure Solopractice to send webhooks to `/api/patient/medications`
- [ ] Test webhook with sample medication data
- [ ] Verify patient registration check works
- [ ] Test medication creation
- [ ] Test medication update
- [ ] Test medication discontinuation
- [ ] Verify refill date calculation
- [ ] Test translation of instructions
- [ ] Verify medications display correctly in UI

## 📝 Solopractice Integration Requirements

### Webhook Configuration
1. **URL**: `https://your-mha-domain.com/api/patient/medications`
2. **Method**: `POST`
3. **Headers**: 
   - `Content-Type: application/json`
   - `x-mha-signature: <INBOUND_WEBHOOK_SECRET>`

### When to Send Webhooks
- **On medication creation**: Send immediately when medication is prescribed
- **On medication update**: Send when refills are filled, refills_remaining changes, or medication details change
- **On medication discontinuation**: Send with `action: 'discontinue'`

### Required Data
- Always include: `patient_id`, `name`, `dosage`, `dosage_unit`, `frequency`
- For refill tracking: `refills_remaining`, `last_refill_date`, `days_supply`
- For translation: `instructions` (will be auto-translated)

## ✅ Status: COMPLETE AND WIRED

All components are implemented and ready:
- ✅ Webhook endpoint created and secured
- ✅ Patient registration check implemented
- ✅ Medication upsert logic complete
- ✅ Refill due date calculation implemented
- ✅ Refill tracking display implemented
- ✅ Medications page loads from database
- ✅ Database schema updated with refill tracking fields
- ✅ All linter checks pass
- ✅ Follows canon rules

The system is ready to receive medication updates from Solopractice and automatically track refills and due dates for registered patients.

