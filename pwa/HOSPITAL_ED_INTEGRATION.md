# Hospital/ED Integration Features

## Overview

Features to help patients communicate with their care team about hospital and emergency department visits, including medication information requests and discharge summary uploads.

## ✅ Implemented Features

### 1. **Send AI Conversation to Care Team**

**Location:** AI Assistant Chat (`/ai-assistant`)

**How it works:**
- "Send to Care Team" button appears in chat header when conversation has messages
- Formats entire conversation with timestamps
- Translates to English for care team
- Sends via messaging system to care team inbox
- Care team receives formatted conversation for review

**Use case:** Patient has a conversation with AI about symptoms, then wants their provider to review it.

---

### 2. **Hospital/ED Records Request - Send Medication & Allergy History**

**Location:** `/hospital-records-request`

**Features:**
- Authorize care team to send patient's medication history and allergies TO hospital/ED
- Automatically loads patient's current medications and allergies
- Supports three visit types:
  - Emergency Department
  - Inpatient/Hospital Stay
  - Outpatient Visit
- Collects:
  - Hospital/facility name, phone, and address
  - Contact name and email (optional)
  - Visit date and type
  - Reason for visit
  - Additional notes

**How it works:**
1. Patient views their current medication and allergy history (auto-loaded)
2. Patient fills out hospital/facility information
3. Patient authorizes care team to send records
4. Formatted authorization request sent to care team with:
   - Complete medication history
   - Complete allergy history
   - Hospital contact information
5. Care team can send this information to the hospital on patient's behalf

**Access:**
- Dashboard: "Hospital/ED" card
- Direct URL: `/hospital-records-request`

---

### 3. **Discharge Summary Upload**

**Location:** `/documents/upload`

**Features:**
- "Discharge Summary (Hospital/ED)" added as document type
- Special instructions shown when discharge summary is selected
- Supports PDF, JPG, PNG uploads
- Camera capture for mobile devices
- Documents uploaded for provider review

**How it works:**
1. Patient selects "Discharge Summary" as document type
2. Uploads discharge summary document (PDF or photo)
3. Document stored in patient uploads
4. Care team notified and can review document
5. Care team updates patient records based on discharge summary

**Access:**
- Dashboard: "Documents" card → Upload
- Direct URL: `/documents/upload`

---

## Integration Flow

### Complete Hospital/ED Visit Workflow

1. **Before/During Visit:**
   - Patient can use AI Assistant to ask questions about their condition
   - Patient can authorize sending medication/allergy history to hospital via `/hospital-records-request`

2. **After Discharge:**
   - Patient uploads discharge summary via `/documents/upload`
   - Patient can send AI conversation to care team if they had questions
   - Patient can authorize sending records if not already done

3. **Care Team Review:**
   - Receives all requests and documents
   - Reviews discharge summary
   - Updates medication list
   - Updates medical records
   - Follows up with patient as needed

---

## API Endpoints

### Send AI Conversation to Care Team
- Uses existing messaging system (`sendMessageToSolopractice`)
- Message includes formatted conversation
- Translated to English automatically

### Hospital Records Request
- Uses existing messaging system
- Includes patient's current medication and allergy history
- Authorization request sent to care team
- Care team can then send records to hospital on patient's behalf

### Document Upload
- Uses existing document upload system
- Discharge summaries stored in `patient-uploads` bucket
- Metadata stored in database

---

## User Experience

### For Patients

1. **Easy Access:**
   - All features accessible from dashboard
   - Clear labels and descriptions
   - Mobile-friendly interfaces

2. **Clear Instructions:**
   - Helpful guidance on each page
   - Explains what happens after submission
   - Shows success/error messages

3. **Multi-language Support:**
   - All forms support patient's preferred language
   - Messages translated to English for care team
   - Responses translated back to patient's language

### For Care Team

1. **Structured Information:**
   - All requests formatted consistently
   - Easy to identify and prioritize
   - All relevant information included

2. **Complete Context:**
   - AI conversations include full context
   - Medication requests include visit details
   - Discharge summaries available for review

---

## Security & Privacy

- All features require patient authentication
- RLS policies ensure patients only see their own data
- Documents stored securely in Supabase Storage
- Messages encrypted in transit
- All data follows HIPAA guidelines

---

## ✅ Additional Implemented Features

### 4. **Visit History Tracking**

**Location:** `/hospital-visits`

**Features:**
- View all hospital and ED visits in chronological order
- See visit details: hospital name, dates, reason, diagnosis
- Track medication reconciliation status
- View discharge summaries
- Access medication reconciliation for each visit

**How it works:**
1. All hospital/ED visits are automatically tracked
2. Patients can view complete visit history
3. Each visit shows status, dates, and follow-up requirements
4. Quick access to medication reconciliation and discharge summaries

**Access:**
- Dashboard: "Visit History" card
- Direct URL: `/hospital-visits`

---

### 5. **Automatic Medication Reconciliation**

**Location:** `/hospital-visits/[id]/reconcile`

**Features:**
- AI-powered extraction of medications from discharge summaries
- Review medication changes (added, modified, discontinued)
- One-click application of changes to medication list
- Tracks reconciliation status per visit

**How it works:**
1. When discharge summary is uploaded, AI extracts medication information
2. System identifies medication changes (new, modified, discontinued)
3. Patient reviews changes before applying
4. One-click to apply all changes to medication list
5. Changes tracked in medication reconciliation table

**Access:**
- From visit history page → "Reconcile Medications" button
- Direct URL: `/hospital-visits/[visit-id]/reconcile`

---

### 6. **Follow-up Reminders**

**Location:** `/follow-up-reminders`

**Features:**
- Automatic reminders created on discharge
- Tracks upcoming and past reminders
- Reminder types: follow-up appointments, medication reviews, lab follow-ups
- Acknowledgment system

**How it works:**
1. When hospital admission is discharged with follow-up required, reminder is automatically created
2. Reminders appear in dedicated page
3. Patients can acknowledge reminders
4. Care team can see reminder status

**Access:**
- Dashboard: "Follow-up Reminders" card
- Direct URL: `/follow-up-reminders`

---

## Future Enhancements

1. **Hospital Integration:** Direct integration with hospital systems (if available) for automatic visit data import
2. **Advanced Parsing:** Enhanced AI parsing for lab results, diagnoses, and procedures from discharge summaries
3. **Reminder Notifications:** Push notifications and email reminders for follow-up appointments
4. **Visit Analytics:** Trends and insights from visit history
