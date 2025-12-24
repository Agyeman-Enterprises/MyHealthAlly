# SoloPractice + MyHealthAlly - Complete Platform Specification

## THE REAL STRATEGY

**Version:** 4.0  
**Date:** December 2024  
**Status:** Definitive Architecture

---

## 1. WHAT WE'RE ACTUALLY BUILDING

### 1.1 The Stack Replacement

| Current (Replace) | New (Build) | Status |
|-------------------|-------------|--------|
| DrChrono | **SoloPractice EMR** | In Progress |
| HealthGorilla | **Direct Lab Integration** | To Build |
| Deepscribe | **ScribeMD** (AI Scribe) | To Build |
| Patient Portal (weak) | **MyHealthAlly** | Phase 1 Done |

### 1.2 The Business Model

```
PHASE 1: EAT YOUR OWN DOG FOOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────┐
│                    OHIMAA GU (Your Practice)                 │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ SoloPractice│  │  ScribeMD   │  │    Labs     │         │
│  │     EMR     │  │  AI Scribe  │  │ Integration │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └────────────────┼────────────────┘                 │
│                          │                                   │
│                          ▼                                   │
│                   ┌─────────────┐                           │
│                   │ MyHealthAlly│                           │
│                   │ Patient App │                           │
│                   └─────────────┘                           │
│                                                              │
│  ✅ Test everything on real patients                        │
│  ✅ Fix bugs before selling                                 │
│  ✅ Prove ROI (time savings, patient satisfaction)          │
└─────────────────────────────────────────────────────────────┘

PHASE 2: SELL TO MARKET
━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────┐
│                    MARKET OPTIONS                            │
│                                                              │
│  OPTION A: Full Stack Sale                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SoloPractice + ScribeMD + Labs + MyHealthAlly      │   │
│  │  "Complete practice management for $X/month"         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  OPTION B: MyHealthAlly Only (FHIR)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MyHealthAlly + FHIR Adapter                         │   │
│  │  "Patient app that works with YOUR existing EMR"     │   │
│  │  → Epic, Cerner, Athena, eCW via FHIR               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  OPTION C: ScribeMD Only                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ScribeMD AI Scribe                                  │   │
│  │  "AI documentation that integrates with any EMR"     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. SOLOPRACTICE EMR - COMPLETE SPEC

### 2.1 What It Replaces (DrChrono Features)

**Must Have (DrChrono Core):**
- ✅ Patient demographics & registration
- ✅ Appointment scheduling
- ✅ Clinical charting (SOAP notes)
- ✅ Problem list / diagnosis management
- ✅ Medication management
- ✅ Allergy tracking
- ✅ Lab ordering & results
- ✅ E-prescribing (Surescripts)
- ✅ Billing & claims
- ✅ Document management
- ✅ Patient portal (→ MyHealthAlly)
- ✅ Reporting & analytics

**Better Than DrChrono:**
- ✅ AI Scribe (ScribeMD) - no Deepscribe needed
- ✅ Unlimited language patient communication
- ✅ True patient engagement (not just portal)
- ✅ Built-in RPM/CCM workflows
- ✅ Direct lab integration (no HealthGorilla fees)

### 2.2 SoloPractice Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOLOPRACTICE EMR                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     CLINICAL MODULES                                 │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │   │
│  │  │  Patient  │ │ Scheduler │ │  Charts   │ │   Labs    │           │   │
│  │  │  Reg/Demo │ │           │ │  (SOAP)   │ │           │           │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │   │
│  │  │    Rx     │ │  Orders   │ │ Documents │ │  Imaging  │           │   │
│  │  │ (eRx/EPCS)│ │           │ │           │ │           │           │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     AI MODULES                                       │   │
│  │  ┌───────────────────────────────┐ ┌───────────────────────────────┐│   │
│  │  │          SCRIBEMD             │ │      CLINICAL DECISION        ││   │
│  │  │  • Real-time transcription    │ │  • Drug interactions          ││   │
│  │  │  • SOAP note generation       │ │  • Allergy alerts             ││   │
│  │  │  • ICD-10/CPT suggestion      │ │  • Care gaps                  ││   │
│  │  │  • Voice commands             │ │  • Quality measures           ││   │
│  │  └───────────────────────────────┘ └───────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     OPERATIONS MODULES                               │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │   │
│  │  │  Billing  │ │  Claims   │ │ Reporting │ │  Admin    │           │   │
│  │  │           │ │           │ │           │ │           │           │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     INTEGRATION LAYER                                │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │   │
│  │  │Surescripts│ │Quest/Lab- │ │ Clearning │ │   FHIR    │           │   │
│  │  │  (eRx)    │ │   Corp    │ │   House   │ │  (Future) │           │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Database Schema (SoloPractice Core)

```sql
-- ============================================
-- SOLOPRACTICE EMR SCHEMA
-- Replaces DrChrono
-- ============================================

-- PRACTICE & USERS
-- ============================================

CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  npi VARCHAR(10),
  tax_id VARCHAR(20),
  address JSONB,
  phone VARCHAR(20),
  fax VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Pacific/Guam',
  
  -- Practice hours (for R1 enforcement)
  practice_hours JSONB DEFAULT '{
    "monday": {"open": "10:00", "close": "18:00"},
    "tuesday": {"open": "10:00", "close": "18:00"},
    "wednesday": {"open": "10:00", "close": "18:00"},
    "thursday": {"open": "10:00", "close": "18:00"},
    "friday": {"open": "10:00", "close": "18:00"},
    "saturday": null,
    "sunday": null
  }',
  
  -- Integration settings
  surescripts_id VARCHAR(50),
  clearinghouse_id VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  
  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  credentials VARCHAR(50), -- MD, DO, NP, PA, MA, etc.
  npi VARCHAR(10),
  dea_number VARCHAR(20),
  
  -- Role & permissions
  role VARCHAR(50) NOT NULL, -- provider, nurse, ma, admin, billing
  permissions JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id),
  
  -- Demographics
  mrn VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  sex VARCHAR(10), -- male, female, other
  gender_identity VARCHAR(50),
  
  -- Contact
  email VARCHAR(255),
  phone_primary VARCHAR(20),
  phone_secondary VARCHAR(20),
  address JSONB,
  
  -- Preferred language (THE MOAT)
  preferred_language VARCHAR(10) DEFAULT 'en',
  interpreter_needed BOOLEAN DEFAULT FALSE,
  
  -- Emergency contact
  emergency_contact JSONB,
  
  -- Insurance
  primary_insurance JSONB,
  secondary_insurance JSONB,
  
  -- Clinical
  primary_provider_id UUID REFERENCES users(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, deceased
  
  -- Photo
  photo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS
-- ============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES users(id),
  
  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Type
  appointment_type VARCHAR(50) NOT NULL, -- office_visit, telehealth, procedure, etc.
  visit_reason TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'scheduled', 
  -- scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show
  
  -- Telehealth
  is_telehealth BOOLEAN DEFAULT FALSE,
  telehealth_link TEXT,
  
  -- Reminders
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  
  -- Billing
  billing_status VARCHAR(20) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENCOUNTERS (Clinical Charts)
-- ============================================

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Encounter info
  encounter_date TIMESTAMPTZ NOT NULL,
  encounter_type VARCHAR(50) NOT NULL,
  
  -- Chief complaint
  chief_complaint TEXT,
  
  -- SOAP Note
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Vitals (can be separate table for trending)
  vitals JSONB,
  
  -- Review of Systems
  ros JSONB,
  
  -- Physical Exam
  physical_exam JSONB,
  
  -- Diagnoses (linked to problems)
  diagnoses JSONB, -- [{icd10: "E11.9", description: "Type 2 diabetes", is_primary: true}]
  
  -- CPT codes
  cpt_codes JSONB, -- [{code: "99214", description: "Office visit", modifiers: []}]
  
  -- Status
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, signed, amended, addended
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES users(id),
  
  -- ScribeMD integration
  scribe_session_id UUID,
  scribe_transcript TEXT,
  scribe_generated_note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROBLEMS (Diagnosis List)
-- ============================================

CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  
  -- Diagnosis
  icd10_code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, resolved, inactive
  onset_date DATE,
  resolved_date DATE,
  
  -- Clinical
  is_chronic BOOLEAN DEFAULT FALSE,
  severity VARCHAR(20), -- mild, moderate, severe
  
  -- Tracking
  added_by UUID REFERENCES users(id),
  added_encounter_id UUID REFERENCES encounters(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICATIONS
-- ============================================

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  
  -- Drug info
  drug_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  ndc VARCHAR(20),
  rxnorm_code VARCHAR(20),
  
  -- Dosing
  strength VARCHAR(50),
  form VARCHAR(50), -- tablet, capsule, injection, etc.
  route VARCHAR(50), -- oral, topical, subcutaneous, etc.
  frequency VARCHAR(100), -- BID, TID, PRN, etc.
  instructions TEXT,
  
  -- Quantity
  quantity INTEGER,
  days_supply INTEGER,
  refills_remaining INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, discontinued, completed
  start_date DATE,
  end_date DATE,
  discontinued_reason TEXT,
  
  -- Prescriber
  prescribed_by UUID REFERENCES users(id),
  prescribed_encounter_id UUID REFERENCES encounters(id),
  
  -- Pharmacy
  pharmacy_id UUID,
  last_filled_date DATE,
  
  -- Controlled substance
  is_controlled BOOLEAN DEFAULT FALSE,
  dea_schedule VARCHAR(5), -- II, III, IV, V
  
  -- Monitoring requirements (for R7 - Refill Safety Gate)
  requires_labs JSONB, -- [{lab: "A1C", frequency_days: 90}]
  last_lab_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALLERGIES
-- ============================================

CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  
  -- Allergen
  allergen_type VARCHAR(50) NOT NULL, -- drug, food, environmental
  allergen_name VARCHAR(255) NOT NULL,
  rxnorm_code VARCHAR(20),
  
  -- Reaction
  reaction TEXT,
  severity VARCHAR(20), -- mild, moderate, severe, life_threatening
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, entered_in_error
  onset_date DATE,
  
  -- Source
  reported_by VARCHAR(50), -- patient, provider, pharmacy
  added_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LAB ORDERS & RESULTS
-- ============================================

CREATE TABLE lab_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  ordering_provider_id UUID REFERENCES users(id),
  encounter_id UUID REFERENCES encounters(id),
  
  -- Order details
  order_number VARCHAR(50),
  lab_vendor VARCHAR(50), -- quest, labcorp, in_house
  
  -- Tests ordered
  tests JSONB NOT NULL, -- [{code: "80053", name: "Comprehensive Metabolic Panel"}]
  
  -- Diagnosis
  diagnosis_codes JSONB, -- ICD-10 codes for medical necessity
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- pending, sent, received, in_progress, completed, cancelled
  
  -- Timing
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  collected_at TIMESTAMPTZ,
  resulted_at TIMESTAMPTZ,
  
  -- Fasting
  fasting_required BOOLEAN DEFAULT FALSE,
  
  -- Specimen
  specimen_type VARCHAR(50),
  collection_instructions TEXT,
  
  -- Integration
  external_order_id VARCHAR(100), -- Quest/LabCorp order ID
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_order_id UUID REFERENCES lab_orders(id),
  patient_id UUID REFERENCES patients(id),
  
  -- Test info
  test_code VARCHAR(20) NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  loinc_code VARCHAR(20),
  
  -- Result
  result_value VARCHAR(100),
  result_unit VARCHAR(50),
  reference_range VARCHAR(100),
  
  -- Flags
  abnormal_flag VARCHAR(20), -- normal, low, high, critical_low, critical_high
  is_critical BOOLEAN DEFAULT FALSE,
  
  -- Interpretation
  interpretation TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'final', -- preliminary, final, corrected
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Notification (for critical values)
  provider_notified_at TIMESTAMPTZ,
  patient_notified_at TIMESTAMPTZ,
  
  resulted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTIONS (e-Prescribing)
-- ============================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  medication_id UUID REFERENCES medications(id),
  prescriber_id UUID REFERENCES users(id),
  encounter_id UUID REFERENCES encounters(id),
  
  -- Rx details
  drug_name VARCHAR(255) NOT NULL,
  strength VARCHAR(50),
  quantity INTEGER NOT NULL,
  days_supply INTEGER NOT NULL,
  refills INTEGER DEFAULT 0,
  
  -- Directions
  sig TEXT NOT NULL, -- "Take 1 tablet by mouth twice daily"
  
  -- Pharmacy
  pharmacy_id UUID REFERENCES pharmacies(id),
  pharmacy_name VARCHAR(255),
  pharmacy_address TEXT,
  pharmacy_phone VARCHAR(20),
  pharmacy_fax VARCHAR(20),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- pending, sent, received, filled, cancelled, denied
  
  -- Surescripts
  surescripts_message_id VARCHAR(100),
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  
  -- EPCS (Controlled Substances)
  is_controlled BOOLEAN DEFAULT FALSE,
  epcs_signed BOOLEAN DEFAULT FALSE,
  epcs_signed_at TIMESTAMPTZ,
  
  -- DAW (Dispense As Written)
  daw_code VARCHAR(5) DEFAULT '0',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pharmacy info
  name VARCHAR(255) NOT NULL,
  ncpdp_id VARCHAR(20), -- National Council for Prescription Drug Programs ID
  npi VARCHAR(10),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  
  -- Contact
  phone VARCHAR(20),
  fax VARCHAR(20),
  
  -- Surescripts
  surescripts_id VARCHAR(50),
  accepts_erx BOOLEAN DEFAULT TRUE,
  accepts_epcs BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTS
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  encounter_id UUID REFERENCES encounters(id),
  
  -- Document info
  document_type VARCHAR(50) NOT NULL,
  -- lab_result, imaging_report, consult_note, discharge_summary, 
  -- insurance_card, consent_form, other
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- File
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Source
  source VARCHAR(50), -- upload, fax, email, integration
  uploaded_by UUID REFERENCES users(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BILLING
-- ============================================

CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id),
  patient_id UUID REFERENCES patients(id),
  
  -- Service
  cpt_code VARCHAR(10) NOT NULL,
  cpt_description TEXT,
  modifiers VARCHAR(20)[],
  
  -- Diagnosis
  diagnosis_pointers INTEGER[], -- Links to encounter diagnoses
  
  -- Amount
  units INTEGER DEFAULT 1,
  unit_charge DECIMAL(10,2) NOT NULL,
  total_charge DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- pending, ready_to_bill, billed, paid, denied, adjusted
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  
  -- Claim info
  claim_number VARCHAR(50),
  payer_name VARCHAR(255),
  payer_id VARCHAR(50),
  
  -- Charges
  charge_ids UUID[],
  total_charges DECIMAL(10,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- pending, submitted, accepted, rejected, paid, denied, appealed
  
  -- Submission
  submitted_at TIMESTAMPTZ,
  clearinghouse_id VARCHAR(100),
  
  -- Response
  response_date DATE,
  paid_amount DECIMAL(10,2),
  adjustment_amount DECIMAL(10,2),
  patient_responsibility DECIMAL(10,2),
  
  -- Denial
  denial_reason_code VARCHAR(20),
  denial_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (Patient Communication)
-- Already exists from previous spec, enhanced for translation
-- ============================================

CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id),
  patient_id UUID REFERENCES patients(id),
  
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'open', -- open, closed
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  
  -- Last activity
  last_message_at TIMESTAMPTZ,
  last_message_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES message_threads(id),
  
  -- Sender
  sender_id UUID NOT NULL, -- user or patient ID
  sender_type VARCHAR(20) NOT NULL, -- patient, provider, staff
  
  -- Content (original)
  body TEXT NOT NULL,
  original_language VARCHAR(10) NOT NULL,
  
  -- Translation (THE MOAT)
  translated_body TEXT, -- English for practice, patient's language for patient
  translation_confidence DECIMAL(3,2),
  translation_reviewed BOOLEAN DEFAULT FALSE,
  
  -- Voice message
  audio_url TEXT,
  audio_duration INTEGER, -- seconds
  audio_transcript TEXT,
  
  -- Attachments
  attachments JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, deferred, blocked
  
  -- Deferral (R3)
  deferred_until TIMESTAMPTZ,
  deferred_reason TEXT,
  
  -- Emergency intercept (R2)
  emergency_detected BOOLEAN DEFAULT FALSE,
  emergency_action TEXT,
  
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORK ITEMS (TODO Queue)
-- ============================================

CREATE TABLE work_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id),
  patient_id UUID REFERENCES patients(id),
  
  -- Type
  item_type VARCHAR(50) NOT NULL,
  -- message, refill_request, lab_result, prior_auth, callback, 
  -- task, appointment_request, document_review
  
  -- Source reference
  source_type VARCHAR(50), -- message, lab_order, prescription, etc.
  source_id UUID,
  
  -- Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Priority & urgency (R4, R5)
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  urgency_color VARCHAR(10), -- green, yellow, red (from R4)
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  
  -- SLA (R5 enforcement)
  due_at TIMESTAMPTZ,
  escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- pending, in_progress, completed, cancelled
  
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who
  user_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  
  -- What
  action VARCHAR(50) NOT NULL, -- view, create, update, delete, export, etc.
  resource_type VARCHAR(50) NOT NULL, -- patient, encounter, message, etc.
  resource_id UUID,
  
  -- Details
  details JSONB,
  
  -- Enforcement rule (if applicable)
  rule_id VARCHAR(10), -- R1, R2, etc.
  rule_action VARCHAR(20), -- allow, block, defer, escalate
  rule_reason TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCRIBEMD SESSIONS
-- ============================================

CREATE TABLE scribe_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID REFERENCES encounters(id),
  provider_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  
  -- Session
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Audio
  audio_url TEXT,
  
  -- Transcript
  transcript TEXT,
  transcript_segments JSONB, -- [{start: 0, end: 5, speaker: "provider", text: "..."}]
  
  -- Generated note
  generated_soap TEXT,
  generated_diagnoses JSONB,
  generated_cpt_codes JSONB,
  
  -- Review status
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  final_note TEXT, -- After provider edits
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
-- ============================================

CREATE INDEX idx_patients_practice ON patients(practice_id);
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_time ON appointments(start_time);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_date ON encounters(encounter_date);
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_due ON work_items(due_at);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_audit_logs_patient ON audit_logs(patient_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 3. SCRIBEMD - AI MEDICAL SCRIBE

### 3.1 What It Replaces (Deepscribe Features)

**Deepscribe Core:**
- ✅ Real-time audio capture
- ✅ Speaker diarization (who's talking)
- ✅ Medical terminology recognition
- ✅ SOAP note generation
- ✅ ICD-10 code suggestion
- ✅ CPT code suggestion

**Better Than Deepscribe:**
- ✅ Runs on your infrastructure (no per-visit fees)
- ✅ Integrated with SoloPractice (no separate login)
- ✅ Multi-language support (patient speaks Korean, note in English)
- ✅ Voice commands for navigation

### 3.2 ScribeMD Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCRIBEMD WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CAPTURE                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Provider starts encounter → ScribeMD starts recording              │   │
│  │  ┌───────────┐     ┌───────────┐     ┌───────────┐                 │   │
│  │  │  Browser  │ ──▶ │  WebRTC   │ ──▶ │  Server   │                 │   │
│  │  │   Mic     │     │  Stream   │     │  Capture  │                 │   │
│  │  └───────────┘     └───────────┘     └───────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  2. TRANSCRIBE                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Real-time transcription with speaker identification               │   │
│  │  ┌───────────┐     ┌───────────┐     ┌───────────────┐             │   │
│  │  │  Audio    │ ──▶ │  Whisper  │ ──▶ │  Diarization  │             │   │
│  │  │  Chunks   │     │   API     │     │  (Speaker ID) │             │   │
│  │  └───────────┘     └───────────┘     └───────────────┘             │   │
│  │                                            │                        │   │
│  │  Output: "Provider: What brings you in today?"                      │   │
│  │          "Patient: 저는 두통이 있어요" (Korean)                      │   │
│  │          "Provider: How long have you had the headache?"            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  3. TRANSLATE (If needed - THE MOAT)                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Patient speaks any language → Transcript in English                │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  "Patient: 저는 두통이 있어요" → "Patient: I have a headache" │ │   │
│  │  │  Stored: Both original and translation for legal record       │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  4. GENERATE                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AI generates structured note from transcript                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  GPT-4 with medical prompting:                              │   │   │
│  │  │                                                              │   │   │
│  │  │  SUBJECTIVE:                                                 │   │   │
│  │  │  45 y/o male presents with headache x 3 days...              │   │   │
│  │  │                                                              │   │   │
│  │  │  OBJECTIVE:                                                  │   │   │
│  │  │  VS: BP 142/88, HR 78, T 98.6...                            │   │   │
│  │  │                                                              │   │   │
│  │  │  ASSESSMENT:                                                 │   │   │
│  │  │  1. Tension headache (G44.209)                              │   │   │
│  │  │  2. Hypertension, uncontrolled (I10)                        │   │   │
│  │  │                                                              │   │   │
│  │  │  PLAN:                                                       │   │   │
│  │  │  1. Ibuprofen 400mg TID PRN...                              │   │   │
│  │  │                                                              │   │   │
│  │  │  Suggested CPT: 99214 (Moderate complexity)                 │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  5. REVIEW & SIGN                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Provider reviews, edits if needed, signs                          │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  [Edit SOAP]  [Modify Dx]  [Adjust CPT]  [Sign Note]         │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │  AI suggestions are ADVISORY ONLY (R9 compliance)                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 ScribeMD Technical Implementation

```typescript
// ScribeMD Service
class ScribeMDService {
  
  // Start recording session
  async startSession(encounterId: string, providerId: string): Promise<{
    sessionId: string;
    websocketUrl: string;
  }> {
    const session = await db.scribeSessions.create({
      encounter_id: encounterId,
      provider_id: providerId,
      started_at: new Date()
    });
    
    return {
      sessionId: session.id,
      websocketUrl: `wss://scribe.solopractice.com/stream/${session.id}`
    };
  }
  
  // Process audio chunk (called from WebSocket)
  async processAudioChunk(
    sessionId: string, 
    audioBuffer: Buffer,
    chunkNumber: number
  ): Promise<{
    transcript: string;
    speaker: 'provider' | 'patient' | 'unknown';
    language: string;
    translation?: string;
  }> {
    // 1. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioBuffer,
      response_format: 'verbose_json'
    });
    
    // 2. Detect speaker (simple: provider speaks English, patient may not)
    const speaker = this.detectSpeaker(transcription);
    
    // 3. Translate if not English
    let translation = null;
    if (transcription.language !== 'en') {
      translation = await this.translateToEnglish(
        transcription.text, 
        transcription.language
      );
    }
    
    // 4. Store segment
    await this.storeSegment(sessionId, {
      chunk_number: chunkNumber,
      start_time: transcription.segments?.[0]?.start || 0,
      text: transcription.text,
      language: transcription.language,
      translation: translation,
      speaker: speaker
    });
    
    return {
      transcript: transcription.text,
      speaker: speaker,
      language: transcription.language,
      translation: translation
    };
  }
  
  // End session and generate note
  async endSession(sessionId: string): Promise<{
    transcript: string;
    generatedNote: GeneratedNote;
  }> {
    // 1. Mark session ended
    await db.scribeSessions.update(sessionId, {
      ended_at: new Date()
    });
    
    // 2. Get full transcript
    const segments = await db.scribeSegments.findBySession(sessionId);
    const transcript = this.assembleTranscript(segments);
    
    // 3. Generate SOAP note
    const generatedNote = await this.generateSOAPNote(transcript);
    
    // 4. Store generated note
    await db.scribeSessions.update(sessionId, {
      transcript: transcript,
      generated_soap: generatedNote.soap,
      generated_diagnoses: generatedNote.diagnoses,
      generated_cpt_codes: generatedNote.cptCodes
    });
    
    return {
      transcript: transcript,
      generatedNote: generatedNote
    };
  }
  
  // Generate SOAP note from transcript
  async generateSOAPNote(transcript: string): Promise<GeneratedNote> {
    const prompt = `You are a medical scribe. Generate a SOAP note from this encounter transcript.

TRANSCRIPT:
${transcript}

Generate:
1. SOAP note (Subjective, Objective, Assessment, Plan)
2. ICD-10 diagnosis codes with descriptions
3. Suggested CPT code with rationale

Return JSON format:
{
  "soap": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  },
  "diagnoses": [
    {"icd10": "E11.9", "description": "Type 2 diabetes mellitus without complications", "isPrimary": true}
  ],
  "cptCodes": [
    {"code": "99214", "description": "Office visit, established patient, moderate complexity", "rationale": "..."}
  ],
  "warnings": [] // Any clinical concerns
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
}
```

---

## 4. LAB INTEGRATION - REPLACE HEALTHGORILLA

### 4.1 Direct Lab Vendor Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LAB INTEGRATION ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SOLOPRACTICE                        LAB VENDORS                            │
│  ┌──────────────────┐                                                       │
│  │                  │    ┌──────────────────────────────────────────┐      │
│  │  Lab Order       │───▶│  QUEST DIAGNOSTICS                       │      │
│  │  Module          │    │  • Quest Care360 API                     │      │
│  │                  │◀───│  • Real-time results                     │      │
│  │  ┌────────────┐  │    │  • HL7 v2 / FHIR                        │      │
│  │  │ Order Form │  │    └──────────────────────────────────────────┘      │
│  │  │ Results    │  │                                                       │
│  │  │ Review     │  │    ┌──────────────────────────────────────────┐      │
│  │  └────────────┘  │───▶│  LABCORP                                 │      │
│  │                  │    │  • Beacon API                            │      │
│  │                  │◀───│  • Real-time results                     │      │
│  └──────────────────┘    │  • HL7 v2 / FHIR                        │      │
│                          └──────────────────────────────────────────┘      │
│                                                                              │
│  BENEFITS:                                                                   │
│  ✅ No HealthGorilla fees ($$$)                                             │
│  ✅ Direct connection = faster results                                       │
│  ✅ Full control of integration                                              │
│  ✅ Works with Guam labs too                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Lab Integration APIs

```typescript
// Lab Integration Service
interface LabVendorAdapter {
  // Order management
  submitOrder(order: LabOrder): Promise<{ orderId: string; status: string }>;
  checkOrderStatus(orderId: string): Promise<OrderStatus>;
  cancelOrder(orderId: string): Promise<boolean>;
  
  // Results
  fetchResults(orderId: string): Promise<LabResult[]>;
  subscribeToResults(callback: (result: LabResult) => void): void;
  
  // Reference data
  getTestCatalog(): Promise<LabTest[]>;
  getCollectionSites(): Promise<CollectionSite[]>;
}

// Quest Diagnostics Adapter
class QuestAdapter implements LabVendorAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.questdiagnostics.com/care360';
  
  async submitOrder(order: LabOrder): Promise<{ orderId: string; status: string }> {
    // Convert to Quest format and submit
    const questOrder = this.convertToQuestFormat(order);
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify(questOrder)
    });
    return response.json();
  }
  
  async fetchResults(orderId: string): Promise<LabResult[]> {
    const response = await fetch(`${this.baseUrl}/results/${orderId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    const questResults = await response.json();
    return this.convertFromQuestFormat(questResults);
  }
}

// LabCorp Adapter
class LabCorpAdapter implements LabVendorAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.labcorp.com/beacon';
  
  // Similar implementation...
}

// Lab Service (unified interface)
class LabService {
  private adapters: Map<string, LabVendorAdapter> = new Map([
    ['quest', new QuestAdapter()],
    ['labcorp', new LabCorpAdapter()]
  ]);
  
  async orderLabs(
    patientId: string,
    tests: string[],
    vendor: 'quest' | 'labcorp',
    diagnosisCodes: string[]
  ): Promise<LabOrder> {
    const adapter = this.adapters.get(vendor);
    
    // Create order in our DB
    const order = await db.labOrders.create({
      patient_id: patientId,
      lab_vendor: vendor,
      tests: tests,
      diagnosis_codes: diagnosisCodes,
      status: 'pending'
    });
    
    // Submit to vendor
    const result = await adapter.submitOrder(order);
    
    // Update with external ID
    await db.labOrders.update(order.id, {
      external_order_id: result.orderId,
      status: 'sent'
    });
    
    return order;
  }
  
  // Webhook handler for incoming results
  async handleResultsWebhook(vendor: string, payload: any): Promise<void> {
    const adapter = this.adapters.get(vendor);
    const results = adapter.parseResultsPayload(payload);
    
    for (const result of results) {
      // Store result
      await db.labResults.create(result);
      
      // Check for critical values (R5 escalation)
      if (result.is_critical) {
        await this.handleCriticalResult(result);
      }
      
      // Create work item for provider review
      await db.workItems.create({
        item_type: 'lab_result',
        source_id: result.id,
        title: `Lab result: ${result.test_name}`,
        priority: result.is_critical ? 'urgent' : 'normal'
      });
    }
  }
}
```

---

## 5. MYHEALTHALLY - PATIENT APP

### 5.1 What Already Exists (Phase 1)

**Android App Complete:**
- ✅ 24 screens
- ✅ PIN + biometric auth
- ✅ Voice recording
- ✅ Message list
- ✅ Dashboard
- ✅ Navigation

### 5.2 What Needs Integration (Phase 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MYHEALTHALLY PHASE 2 INTEGRATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PATIENT APP                         SOLOPRACTICE BACKEND                   │
│  ┌──────────────────┐                ┌──────────────────────────────┐      │
│  │                  │                │                               │      │
│  │  Voice Message   │───────────────▶│  Translation Layer           │      │
│  │  (any language)  │                │  → English for practice      │      │
│  │                  │◀───────────────│  → Patient's lang for reply  │      │
│  │                  │                │                               │      │
│  │  Vital Logging   │───────────────▶│  Enforcement (R4, R5)        │      │
│  │  (BP, glucose)   │                │  → Urgency classification    │      │
│  │                  │◀───────────────│  → Escalation if critical    │      │
│  │                  │                │                               │      │
│  │  Refill Request  │───────────────▶│  Enforcement (R7)            │      │
│  │                  │                │  → Lab requirement check      │      │
│  │                  │◀───────────────│  → Block if unsafe           │      │
│  │                  │                │                               │      │
│  │  Appointment     │───────────────▶│  Enforcement (R1, R3)        │      │
│  │  Request         │                │  → Practice hours check       │      │
│  │                  │◀───────────────│  → Defer if after hours      │      │
│  │                  │                │                               │      │
│  │  Lab Results     │◀───────────────│  From lab integration        │      │
│  │  (view only)     │                │  → Translated to patient lang│      │
│  │                  │                │                               │      │
│  │  Care Plan       │◀───────────────│  From provider charting      │      │
│  │                  │                │                               │      │
│  └──────────────────┘                └──────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. IMPLEMENTATION ROADMAP (REVISED)

### Phase 1: Fix Critical Issues (Week 1-2)
**Owner:** Cursor

- [ ] Fix Android security vulnerabilities
- [ ] Fix placeholder values (JWT extraction)
- [ ] Fix thread management
- [ ] Test end-to-end message flow

**Deliverable:** Android app can actually send messages to SoloPractice

### Phase 2: Complete SoloPractice EMR Core (Week 3-8)
**Owner:** Cursor

- [ ] Patient registration/demographics
- [ ] Appointment scheduling
- [ ] Clinical charting (SOAP notes) - manual first
- [ ] Problem list management
- [ ] Medication management
- [ ] Allergy tracking
- [ ] Document management
- [ ] **Provider Dashboard for MHA messages**

**Deliverable:** Replace DrChrono for basic workflows

### Phase 3: ScribeMD Integration (Week 9-12)
**Owner:** Cursor

- [ ] Audio capture (WebRTC)
- [ ] Real-time transcription (Whisper)
- [ ] Multi-language support (translation)
- [ ] SOAP note generation (GPT-4)
- [ ] ICD-10/CPT suggestion
- [ ] Provider review workflow

**Deliverable:** Replace Deepscribe

### Phase 4: Lab Integration (Week 13-16)
**Owner:** Cursor

- [ ] Quest Diagnostics API integration
- [ ] LabCorp API integration
- [ ] Order entry workflow
- [ ] Results import
- [ ] Critical value handling (R5)
- [ ] Patient results delivery (translated)

**Deliverable:** Replace HealthGorilla

### Phase 5: Translation Layer (Week 17-20)
**Owner:** Cursor

- [ ] Language auto-detection
- [ ] Voice transcription (any language)
- [ ] Text translation (GPT-4)
- [ ] Low-confidence flagging
- [ ] Community validation workflow

**Deliverable:** THE MOAT is complete

### Phase 6: E-Prescribing (Week 21-24)
**Owner:** Cursor (or vendor)

- [ ] Surescripts certification
- [ ] NewRx workflow
- [ ] Refill request/response
- [ ] EPCS (controlled substances)
- [ ] Pharmacy directory

**Deliverable:** Replace DrChrono Rx

### Phase 7: Billing (Week 25-28)
**Owner:** Cursor

- [ ] Charge capture
- [ ] Claim generation
- [ ] Clearinghouse integration
- [ ] ERA processing
- [ ] Patient billing

**Deliverable:** Replace DrChrono billing

---

## 7. SUCCESS = REPLACE YOUR CURRENT STACK

| Tool | Monthly Cost | Replaced By | Savings |
|------|-------------|-------------|---------|
| DrChrono | $XXX | SoloPractice | 100% |
| HealthGorilla | $XXX | Direct Lab Integration | 100% |
| Deepscribe | $XXX/visit | ScribeMD | 100% |
| **Total** | **$XXX** | **$0 (your infrastructure)** | **100%** |

Plus: Better patient engagement, unlimited languages, RPM/CCM ready, AI-powered.

---

## 8. MARKET EXPANSION (LATER)

Once tested at Ohimaa GU:

### Option A: Sell Full Stack
- SoloPractice + ScribeMD + Labs + MyHealthAlly
- Target: Small practices leaving DrChrono/athena/eCW
- Pricing: $X per provider per month

### Option B: Sell MyHealthAlly Only
- Add FHIR adapters for Epic/Cerner/Athena
- Target: Any practice wanting better patient engagement
- Pricing: $X per patient per month

### Option C: Sell ScribeMD Only
- Standalone AI scribe with EMR integrations
- Target: Any provider wanting to reduce documentation time
- Pricing: $X per provider per month

---

**The strategy is clear: Build for yourself first, prove it works, then sell to the market.**
