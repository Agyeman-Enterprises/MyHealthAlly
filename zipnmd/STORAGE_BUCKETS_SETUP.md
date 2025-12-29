# Supabase Storage Buckets Setup

**Status:** ✅ **READY TO DEPLOY**  
**Purpose:** Configure Supabase Storage buckets for MHA document and audio storage

---

## 📦 **Storage Buckets**

### **1. patient-uploads**
- **Purpose:** Patient document uploads (insurance cards, medical records, intake forms)
- **Size Limit:** 10MB
- **Allowed Types:** PDF, JPEG, PNG, JPG
- **Privacy:** Private (RLS enforced)
- **Path Structure:** `documents/{patient_id}/{timestamp}-{filename}`

### **2. voice-recordings**
- **Purpose:** Voice recordings from patients (any language)
- **Size Limit:** 50MB
- **Allowed Types:** WebM, MP4, MPEG, AAC, M4A, WAV
- **Privacy:** Private (RLS enforced)
- **Path Structure:** `recordings/{patient_id}/{timestamp}-{filename}`

### **3. invoices**
- **Purpose:** Generated invoice PDFs
- **Size Limit:** 5MB
- **Allowed Types:** PDF
- **Privacy:** Private (RLS enforced)
- **Path Structure:** `invoices/{patient_id}/{invoice_id}.pdf`

---

## 🔒 **Row Level Security (RLS) Policies**

### **Patient Access:**
- ✅ Patients can upload their own documents
- ✅ Patients can view their own documents
- ✅ Patients can upload their own voice recordings
- ✅ Patients can view their own voice recordings
- ✅ Patients can view their own invoices

### **Clinician Access:**
- ✅ Clinicians can view their patients' documents
- ✅ Clinicians can view their patients' voice recordings
- ✅ Clinicians can view their patients' invoices

---

## 🚀 **Setup Instructions**

### **Step 1: Run SQL Script**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the script: `pwa/scripts/setup-storage-buckets.sql`

### **Step 2: Verify Buckets**

1. Go to Storage in Supabase Dashboard
2. Verify three buckets exist:
   - `patient-uploads`
   - `voice-recordings`
   - `invoices`

### **Step 3: Test Upload**

1. Test document upload from patient portal
2. Verify file appears in `patient-uploads` bucket
3. Verify RLS policies work (patient can see own files)

---

## 📝 **Usage in Code**

### **Document Upload:**
```typescript
const fileName = `documents/${patientId}/${Date.now()}-${file.name}`;
const { data, error } = await supabase.storage
  .from('patient-uploads')
  .upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });
```

### **Voice Recording:**
```typescript
const fileName = `recordings/${patientId}/${Date.now()}-voice.m4a`;
const { data, error } = await supabase.storage
  .from('voice-recordings')
  .upload(fileName, audioBlob, {
    contentType: 'audio/m4a',
    upsert: false,
  });
```

### **Get Public URL:**
```typescript
const { data } = supabase.storage
  .from('patient-uploads')
  .getPublicUrl(fileName);
```

---

## ✅ **Status**

- ✅ Bucket definitions created
- ✅ RLS policies defined
- ✅ Path structure documented
- ⚠️ **Action Required:** Run SQL script in Supabase Dashboard

---

**Next Step:** Run `pwa/scripts/setup-storage-buckets.sql` in Supabase SQL Editor

