# Missing API Endpoints - Where to Get Them

**Date:** December 2024  
**Status:** Backend API endpoints needed for remaining screens

---

## 🎯 **8 Screens Need Backend APIs**

These screens are blocked because they need new API endpoints in Solopractice:

---

## 1. **LabsScreen** 🔬

### **What's Needed:**
- `GET /api/portal/labs` - Get patient lab results
- `GET /api/portal/labs/{id}` - Get specific lab result
- `GET /api/portal/labs/{id}/download` - Download lab report PDF

### **Data Model:**
```typescript
interface LabResult {
  id: string;
  patient_id: string;
  test_name: string;
  test_type: string;
  ordered_date: string;
  result_date?: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  results?: {
    [key: string]: {
      value: string | number;
      unit: string;
      reference_range: string;
      flag?: 'normal' | 'high' | 'low' | 'critical';
    };
  };
  provider_name?: string;
  notes?: string;
  pdf_url?: string;
  created_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/labs/route.ts`

### **Integration:**
- Connect to your lab system (if external)
- Or create lab results table in Supabase
- Ensure R10 (Patient Transparency) logging

---

## 2. **PharmacyScreen** 💊

### **What's Needed:**
- `GET /api/portal/pharmacy` - Get preferred pharmacy info
- `PUT /api/portal/pharmacy` - Update preferred pharmacy
- `GET /api/portal/pharmacy/nearby` - Get nearby pharmacies (optional)

### **Data Model:**
```typescript
interface Pharmacy {
  id: string;
  patient_id: string;
  name: string;
  address: string;
  phone: string;
  fax?: string;
  is_preferred: boolean;
  created_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/pharmacy/route.ts`

### **Integration:**
- Store in Supabase `pharmacies` table
- Link to patient via `patient_id`
- Allow patients to set preferred pharmacy

---

## 3. **NutritionScreen** 🥗

### **What's Needed:**
- `GET /api/portal/nutrition/plan` - Get nutrition plan/recommendations
- `POST /api/portal/nutrition/log` - Log meal/food (optional)
- `GET /api/portal/nutrition/logs` - Get nutrition logs (optional)

### **Data Model:**
```typescript
interface NutritionPlan {
  id: string;
  patient_id: string;
  provider_id: string;
  dietary_restrictions: string[];
  recommendations: string;
  daily_calories?: number;
  macronutrients?: {
    protein_grams?: number;
    carbs_grams?: number;
    fat_grams?: number;
  };
  created_at: string;
  updated_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/nutrition/route.ts`

### **Integration:**
- Store in Supabase `nutrition_plans` table
- Can be part of care plan or separate
- Provider creates, patient views

---

## 4. **ExercisesScreen** 🏃

### **What's Needed:**
- `GET /api/portal/exercises/plan` - Get exercise plan/recommendations
- `POST /api/portal/exercises/log` - Log exercise activity (optional)
- `GET /api/portal/exercises/logs` - Get exercise logs (optional)

### **Data Model:**
```typescript
interface ExercisePlan {
  id: string;
  patient_id: string;
  provider_id: string;
  exercises: {
    name: string;
    description: string;
    duration_minutes?: number;
    frequency: string; // "3x per week"
    instructions?: string;
  }[];
  created_at: string;
  updated_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/exercises/route.ts`

### **Integration:**
- Store in Supabase `exercise_plans` table
- Can be part of care plan or separate
- Provider creates, patient views

---

## 5. **ResourcesScreen** 📚

### **What's Needed:**
- `GET /api/portal/resources` - Get educational resources
- `GET /api/portal/resources/{id}` - Get specific resource
- `GET /api/portal/resources/categories` - Get resource categories

### **Data Model:**
```typescript
interface Resource {
  id: string;
  title: string;
  category: string; // "general", "condition_specific", "medication", etc.
  content: string; // HTML or markdown
  type: 'article' | 'video' | 'pdf' | 'link';
  url?: string;
  thumbnail_url?: string;
  practice_id?: string; // Practice-specific resources
  created_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/resources/route.ts`

### **Integration:**
- Store in Supabase `resources` table
- Can be practice-specific or global
- Content management system for providers

---

## 6. **AISymptomAssistantScreen** 🤖

### **What's Needed:**
- `POST /api/portal/ai/symptom-analysis` - Analyze symptoms
- `GET /api/portal/ai/symptom-analysis/{id}` - Get analysis result

### **Data Model:**
```typescript
interface SymptomAnalysisRequest {
  symptoms: string[];
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  additional_context?: string;
}

interface SymptomAnalysisResponse {
  id: string;
  possible_conditions: {
    condition: string;
    likelihood: number; // 0-100
    recommendation: string;
  }[];
  urgency: 'routine' | 'urgent' | 'emergency';
  recommendation: string;
  disclaimer: string; // "This is not a diagnosis..."
  created_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/ai/symptom-analysis/route.ts`

### **Integration:**
- Integrate with AI service (OpenAI, medical AI API, etc.)
- **IMPORTANT:** Must enforce R9 (AI Advisory Boundary)
- All AI outputs must be marked as advisory only
- Require provider approval for any clinical actions

---

## 7. **AITriageScreen** 🚨

### **What's Needed:**
- `POST /api/portal/ai/triage` - Triage patient symptoms
- `GET /api/portal/ai/triage/{id}` - Get triage result

### **Data Model:**
```typescript
interface TriageRequest {
  symptoms: string[];
  patient_age?: number;
  medical_history?: string[];
  current_medications?: string[];
}

interface TriageResponse {
  id: string;
  urgency_level: 'green' | 'yellow' | 'red';
  recommendation: 'self_care' | 'see_provider' | 'urgent_care' | 'emergency';
  reasoning: string;
  next_steps: string[];
  disclaimer: string;
  created_at: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/ai/triage/route.ts`

### **Integration:**
- Integrate with medical triage AI service
- **IMPORTANT:** Must enforce R9 (AI Advisory Boundary)
- Red/yellow triage should trigger R5 (Hard Escalation)
- All AI outputs are advisory only

---

## 8. **UploadRecordsScreen** 📄

### **What's Needed:**
- `POST /api/portal/records/upload` - Upload medical record/document
- `GET /api/portal/records` - Get patient's uploaded records
- `GET /api/portal/records/{id}/download` - Download record
- `DELETE /api/portal/records/{id}` - Delete record

### **Data Model:**
```typescript
interface MedicalRecord {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: string; // "pdf", "image", etc.
  file_size: number;
  file_url: string;
  category: 'lab_result' | 'imaging' | 'doctor_note' | 'other';
  uploaded_at: string;
  description?: string;
}
```

### **Where to Implement:**
**Solopractice Backend:** `app/api/portal/records/route.ts`

### **Integration:**
- Use Supabase Storage for file storage
- Store metadata in Supabase `medical_records` table
- Ensure R10 (Patient Transparency) logging
- File size limits and type validation

---

## 📋 **Implementation Checklist for Solopractice Backend**

### **For Each Endpoint:**

1. ✅ **Create API Route**
   - `app/api/portal/[feature]/route.ts` (Next.js App Router)
   - Or `app/api/portal/[feature]/[id]/route.ts` for detail endpoints

2. ✅ **Add Database Tables** (if needed)
   - Create Supabase tables
   - Add RLS policies
   - Add indexes

3. ✅ **Enforce CG Rules**
   - R10: Patient Transparency Logging
   - R9: AI Advisory Boundary (for AI endpoints)
   - R5: Hard Escalation (for urgent triage)

4. ✅ **Add to API Client**
   - Add to `SoloPracticeApi.kt` interface
   - Add to `SoloPracticeApiClient.kt`
   - Add models to `SoloPracticeModels.kt`

5. ✅ **Test**
   - Test with Postman/curl
   - Verify RLS policies
   - Verify audit logging

---

## 🚀 **Priority Order**

### **High Priority (Most Useful):**
1. **UploadRecordsScreen** - Patients need to upload documents
2. **LabsScreen** - Critical for patient engagement
3. **ResourcesScreen** - Educational content

### **Medium Priority:**
4. **PharmacyScreen** - Useful but not critical
5. **NutritionScreen** - Nice to have
6. **ExercisesScreen** - Nice to have

### **Low Priority (Requires AI Integration):**
7. **AISymptomAssistantScreen** - Requires AI service integration
8. **AITriageScreen** - Requires AI service integration

---

## 📝 **Quick Start Template**

For each endpoint, use this template:

```typescript
// app/api/portal/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enforcePatientTransparency } from '@/lib/enforcement/r10';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Get patient ID from token
    const patientId = getPatientIdFromToken(token);
    
    // 3. Query database
    const supabase = createClient(...);
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .eq('patient_id', patientId);
    
    if (error) throw error;
    
    // 4. Log access (R10)
    await enforcePatientTransparency({
      patientId,
      resource: '[feature]',
      action: 'read'
    });
    
    // 5. Return data
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🔗 **Where to Find Existing Examples**

Look at existing Solopractice endpoints for patterns:
- `app/api/portal/messages/route.ts` - Message endpoints
- `app/api/portal/meds/route.ts` - Medication endpoints
- `app/api/portal/measurements/route.ts` - Measurement endpoints

---

**Last Updated:** December 2024  
**Next Step:** Implement endpoints in Solopractice backend, then update Android app to use them
