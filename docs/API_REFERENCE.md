# MyHealthAlly API Reference

## Base URL

- **Development**: `http://localhost:3000` (or port from startup script)
- **Production**: `https://api.yourdomain.com`

## Authentication

All protected endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### JWT Token Format

**Header Structure:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```typescript
{
  email: string;
  sub: string;        // User ID
  role: string;       // PATIENT | PROVIDER | MEDICAL_ASSISTANT | ADMIN
  iat: number;        // Issued at
  exp: number;        // Expiration
}
```

**Token Expiration:** 15 minutes (default, configurable via `JWT_EXPIRES_IN`)

---

## Authentication Endpoints

### POST /auth/login

Login and receive access token.

**Request:**
```typescript
{
  email: string;      // Valid email
  password: string;   // Min 6 characters
}
```

**Response:**
```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;           // PATIENT | PROVIDER | MEDICAL_ASSISTANT | ADMIN
    clinicId?: string;
    patientId?: string;
    providerId?: string;
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Validation error

---

### POST /auth/register

Register a new user account.

**Request:**
```typescript
{
  email: string;
  password: string;        // Min 6 characters
  role: string;            // PATIENT | PROVIDER | MEDICAL_ASSISTANT | ADMIN
  firstName?: string;
  lastName?: string;
}
```

**Response:**
```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    clinicId?: string;
    patientId?: string;
    providerId?: string;
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or email already exists
- `409 Conflict` - User already exists

---

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

### POST /auth/profile

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  id: string;
  email: string;
  role: string;
  clinicId?: string;
  patientId?: string;
  providerId?: string;
}
```

---

## Patient Endpoints

### GET /patients/me

Get current patient's own record (PATIENT role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  id: string;
  userId: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;      // ISO date string
  heightCm?: number;
  demographics?: any;
  flags: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  }
}
```

---

### GET /patients/analytics

Get patient analytics including HRV trends, recovery score, stress level, latest vitals, and BMI.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  recoveryScore: number;        // 0-100
  stressLevel: 'low' | 'moderate' | 'high';
  latestVitals: {
    heartRate?: number;         // bpm
    spo2?: number;              // %
    respiration?: number;       // breaths/min
    systolicBP?: number;        // mmHg
    diastolicBP?: number;       // mmHg
  } | null;
  hrvTrend: Array<{
    timestamp: string;          // ISO date string
    rmssdMs: number;            // milliseconds
  }>;
  bmi: {
    id: string;
    patientId: string;
    timestamp: string;
    weightKg: number;
    heightCm: number;
    bmi: number;                // Calculated BMI (critical for GLP-1 medication tracking)
  } | null;
}
```

**Important Notes:**
- **BMI is critical** for GLP-1 medication (e.g., Ozempic, Wegovy, Mounjaro) prescription eligibility and progress tracking
- BMI is automatically calculated when weight/height data is received from devices (Withings, etc.)
- BMI formula: `BMI = weightKg / (heightCm / 100)²`
- BMI trends are essential for monitoring weight loss progress on GLP-1 medications

---

### GET /patients/:patientId/measurements

Get all measurements for a patient.

**Query Parameters:**
- None

**Response:**
```typescript
Array<{
  id: string;
  patientId: string;
  type: string;                // BLOOD_PRESSURE, GLUCOSE, WEIGHT, etc.
  value: number | object;      // Can be number or object (e.g., {systolic: 120, diastolic: 80})
  timestamp: string;           // ISO date string
  source: string;              // HEALTHKIT, MANUAL, DEVICE
  metadata?: any;
  createdAt: string;
}>
```

---

### POST /patients/:patientId/measurements

Create a new measurement.

**Request:**
```typescript
{
  type: string;                // MeasurementType enum
  value: number | Record<string, any>;
  timestamp: string;           // ISO date string
  source: string;              // HEALTHKIT, MANUAL, DEVICE
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  id: string;
  patientId: string;
  type: string;
  value: number | object;
  timestamp: string;
  source: string;
  metadata?: any;
  createdAt: string;
}
```

---

### GET /patients/:patientId/care-plans

Get care plan for a patient.

**Response:**
```typescript
{
  id: string;
  patientId: string;
  phases: Array<{
    name: string;
    durationWeeks: number;
    tasks: Array<{
      id: string;
      title: string;
      description?: string;
      frequency: string;
      completed: boolean;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

### POST /patients/:patientId/care-plans

Create or update care plan.

**Request:**
```typescript
{
  phases: Array<CarePlanPhase>;
}
```

---

### GET /alerts

Get all active alerts for current user.

**Response:**
```typescript
Array<{
  id: string;
  patientId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: string;
  title: string;
  body: string;
  payload?: any;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
}>
```

---

### GET /alerts/patients/:patientId

Get alerts for a specific patient.

---

### POST /alerts

Create a new alert.

**Request:**
```typescript
{
  patientId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: string;
  title: string;
  body: string;
  payload?: Record<string, any>;
}
```

---

### PATCH /alerts/:id/resolve

Resolve an alert.

**Request:**
```typescript
{
  note?: string;
}
```

---

### GET /messaging/threads

Get all message threads for current user.

**Response:**
```typescript
Array<{
  id: string;
  patientId: string;
  clinicId?: string;
  participants: string[];      // Array of user IDs
  subject?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}>
```

---

### GET /messaging/threads/:threadId

Get a specific message thread with messages.

**Response:**
```typescript
{
  id: string;
  patientId: string;
  clinicId?: string;
  participants: string[];
  subject?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    threadId: string;
    senderId: string;
    content: string;
    attachments?: Array<{
      type: string;
      url: string;
      filename: string;
      size: number;
    }>;
    read: boolean;
    readAt?: string;
    createdAt: string;
  }>;
}
```

---

### POST /messaging/threads/:threadId/messages

Send a message in a thread.

**Request (multipart/form-data):**
```typescript
{
  content: string;
  files?: File[];              // Optional file attachments (max 5)
}
```

**Response:**
```typescript
{
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
    size: number;
  }>;
  read: boolean;
  createdAt: string;
}
```

---

### GET /messaging/unread-count

Get unread message count for current user.

**Response:**
```typescript
{
  count: number;
}
```

---

### POST /visit-requests/walk-in

Create a walk-in visit request.

**Request:**
```typescript
{
  patientId: string;
  visitMode: 'VIRTUAL' | 'IN_PERSON';
  reasonText: string;
  reasonCategory?: string;
  severity?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
}
```

**Response:**
```typescript
{
  id: string;
  patientId: string;
  requestType: 'WALK_IN';
  visitMode: 'VIRTUAL' | 'IN_PERSON';
  reasonText: string;
  reasonCategory?: string;
  severity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  status: 'NEW' | 'TRIAGED' | 'AWAITING_PATIENT_CONFIRMATION' | 'CONVERTED_TO_VISIT' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName?: string;
    lastName?: string;
    user: {
      email: string;
    };
  };
}
```

**Error Responses:**
- `400 Bad Request` - RED severity blocks scheduling (emergency protocol required)

---

### POST /visit-requests/scheduled

Create a scheduled visit request.

**Request:**
```typescript
{
  patientId: string;
  visitMode: 'VIRTUAL' | 'IN_PERSON';
  requestedDate?: string;      // ISO date string
  windowStart?: string;        // ISO date string
  windowEnd?: string;          // ISO date string
  reasonText: string;
  reasonCategory?: string;
  severity?: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
}
```

---

### GET /visit-requests/patient/:patientId

Get all visit requests for a patient.

---

### GET /visits/patient/:patientId

Get all visits for a patient.

**Query Parameters:**
- `status?`: `PLANNED` | `CHECKED_IN` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED` | `NO_SHOW`
- `startDate?`: ISO date string
- `endDate?`: ISO date string

**Response:**
```typescript
Array<{
  id: string;
  patientId: string;
  providerId: string;
  slotId: string;
  visitType: 'WALK_IN' | 'SCHEDULED';
  visitMode: 'VIRTUAL' | 'IN_PERSON';
  reasonText: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: string;
    name: string;
    specialties: string[];
  };
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    visitMode: string;
  };
  virtualSession?: {
    id: string;
    roomId: string;
    status: 'NOT_STARTED' | 'WAITING' | 'ACTIVE' | 'ENDED';
  };
}>
```

---

## Clinician Endpoints

### GET /patients

Get all patients (filtered by clinic if user is clinic staff).

**Response:**
```typescript
Array<{
  id: string;
  userId: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  heightCm?: number;
  demographics?: any;
  flags: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}>
```

---

### GET /patients/:id

Get a specific patient by ID.

**Response:**
```typescript
{
  id: string;
  userId: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  heightCm?: number;
  demographics?: any;
  flags: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  clinic: {
    id: string;
    name: string;
  };
}
```

---

### GET /visits/provider/:providerId

Get all visits for a provider.

**Query Parameters:**
- `status?`: VisitStatus enum
- `startDate?`: ISO date string
- `endDate?`: ISO date string

---

### GET /visits/:id

Get a specific visit by ID.

---

### PUT /visits/:id/status

Update visit status.

**Request:**
```typescript
{
  status: 'PLANNED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}
```

**State Machine Rules:**
- `PLANNED` → `CHECKED_IN`, `CANCELLED`
- `CHECKED_IN` → `IN_PROGRESS`, `NO_SHOW`, `CANCELLED`
- `IN_PROGRESS` → `COMPLETED`, `CANCELLED`
- `COMPLETED` → (terminal)
- `CANCELLED` → (terminal)
- `NO_SHOW` → (terminal)

---

### GET /slots/available

Find available visit slots.

**Query Parameters:**
- `providerId?`: string
- `visitMode?`: `VIRTUAL` | `IN_PERSON`
- `startDate?`: ISO date string
- `endDate?`: ISO date string
- `minDurationMinutes?`: number

**Response:**
```typescript
Array<{
  id: string;
  providerId: string;
  startTime: string;           // ISO date string
  endTime: string;             // ISO date string
  visitMode: 'VIRTUAL' | 'IN_PERSON';
  status: 'FREE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  heldUntil?: string;          // ISO date string
  createdAt: string;
  updatedAt: string;
}>
```

---

### PUT /slots/:id/hold

Hold a slot temporarily.

**Request:**
```typescript
{
  expiry: string;              // ISO date string
}
```

---

### PUT /slots/:id/book

Book a slot (changes status to BOOKED).

---

### PUT /slots/:id/release

Release a held slot (changes status back to FREE).

---

### POST /virtual-visits/visit/:visitId/session

Create a virtual visit session.

**Response:**
```typescript
{
  id: string;
  visitId: string;
  roomId: string;              // Daily.co room ID
  status: 'NOT_STARTED' | 'WAITING' | 'ACTIVE' | 'ENDED';
  createdAt: string;
  updatedAt: string;
}
```

---

### PUT /virtual-visits/visit/:visitId/join-patient

Join virtual visit as patient.

---

### PUT /virtual-visits/visit/:visitId/join-provider

Join virtual visit as provider.

---

### PUT /virtual-visits/visit/:visitId/end

End virtual visit session.

---

### GET /virtual-visits/visit/:visitId/session

Get virtual visit session details.

---

### GET /virtual-visits/active

Get active virtual visit sessions.

**Query Parameters:**
- `providerId?`: string

---

### GET /visit-requests

Get all visit requests (with filters).

**Query Parameters:**
- `status?`: `NEW` | `TRIAGED` | `AWAITING_PATIENT_CONFIRMATION` | `CONVERTED_TO_VISIT` | `CANCELLED`
- `requestType?`: `WALK_IN` | `SCHEDULED`
- `severity?`: `GREEN` | `YELLOW` | `ORANGE` | `RED`

---

### PUT /visit-requests/:id/triage

Triage a visit request.

---

### PUT /visit-requests/:id/offer-slots

Offer slots to patient for a visit request.

**Request:**
```typescript
{
  slotIds: string[];
}
```

---

### POST /visit-requests/:id/assign-immediate

Assign immediate visit to a request.

**Request:**
```typescript
{
  providerId: string;
  slotId: string;
}
```

---

### PUT /visit-requests/:id/convert-to-visit

Convert a visit request to a visit.

**Request:**
```typescript
{
  providerId: string;
}
```

---

## Device Webhook Endpoints

### POST /device/webhook/oura

Oura device webhook endpoint.

**Headers:**
- `x-oura-signature`: Webhook signature (for verification)

**Request Body:**
```typescript
{
  user_id: string;
  hrv?: Array<{
    timestamp: string;
    rmssd_ms: number;
  }>;
  heart_rate?: Array<{
    timestamp: string;
    bpm: number;
  }>;
  // ... other Oura data fields
}
```

---

### POST /device/webhook/fitbit

Fitbit device webhook endpoint.

---

### POST /device/webhook/garmin

Garmin device webhook endpoint.

---

### POST /device/webhook/withings

Withings device webhook endpoint (for BMI/weight).

**Request Body:**
```typescript
{
  external_user_id: string;
  weight_kg: number;
  height_cm?: number;
}
```

---

## Health Check

### GET /health

Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

---

## Error Response Format

All errors follow this format:

```typescript
{
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

**Common Status Codes:**
- `400 Bad Request` - Validation error or invalid request
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., email already exists)
- `500 Internal Server Error` - Server error

**Example Error Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

---

## CORS

CORS is enabled for:
- Development: `http://localhost:3001` (or frontend port)
- Production: Configured via `FRONTEND_URL` environment variable

---

## Lab Orders Endpoints

### POST /lab-orders

Create a new lab order.

**Request:**
```typescript
{
  patientId: string;
  visitId?: string;
  providerId: string;
  tests: string[];        // e.g., ["CBC", "CMP", "A1C", "Lipid Panel"]
  notes?: string;
}
```

**Response:**
```typescript
{
  id: string;
  patientId: string;
  visitId?: string;
  providerId: string;
  tests: string[];
  notes?: string;
  status: 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  orderedAt: string;
  completedAt?: string;
  results?: any;
  createdAt: string;
  updatedAt: string;
}
```

---

### GET /lab-orders/patient/:patientId

Get all lab orders for a patient.

**Response:**
```typescript
Array<LabOrder>
```

---

### GET /lab-orders/provider/:providerId

Get all lab orders for a provider.

---

### GET /lab-orders/:id

Get a specific lab order by ID.

---

### PUT /lab-orders/:id/status

Update lab order status and optionally add results.

**Request:**
```typescript
{
  status: 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  results?: any;          // Lab results JSON when status is COMPLETED
}
```

---

## Referrals Endpoints

### POST /referrals

Create a new referral.

**Request:**
```typescript
{
  patientId: string;
  visitId?: string;
  providerId: string;
  specialty: string;      // e.g., "Cardiology", "Endocrinology", "Physical Therapy"
  reason: string;
  priority?: 'ROUTINE' | 'URGENT' | 'STAT';
  referredTo?: string;    // Provider/clinic name
  notes?: string;
}
```

**Response:**
```typescript
{
  id: string;
  patientId: string;
  visitId?: string;
  providerId: string;
  specialty: string;
  reason: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  referredTo?: string;
  notes?: string;
  sentAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### POST /referrals/:id/send

Send referral to patient (updates status to SENT).

---

### GET /referrals/patient/:patientId

Get all referrals for a patient.

---

### GET /referrals/provider/:providerId

Get all referrals for a provider.

---

### GET /referrals/:id

Get a specific referral by ID.

---

### PUT /referrals/:id/status

Update referral status.

**Request:**
```typescript
{
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
}
```

---

## Excuse Notes / Medical Documents Endpoints

### POST /excuse-notes

Create a new excuse note or medical document.

**Request:**
```typescript
{
  patientId: string;
  visitId?: string;
  providerId: string;
  type: 'WORK' | 'SCHOOL' | 'GENERAL';
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
  reason: string;
  restrictions?: string;  // e.g., "No heavy lifting", "Light duty only"
}
```

**Response:**
```typescript
{
  id: string;
  patientId: string;
  visitId?: string;
  providerId: string;
  type: 'WORK' | 'SCHOOL' | 'GENERAL';
  startDate: string;
  endDate: string;
  reason: string;
  restrictions?: string;
  status: 'DRAFT' | 'SENT' | 'EXPIRED';
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### POST /excuse-notes/:id/send

Send excuse note to patient (updates status to SENT, generates PDF).

---

### GET /excuse-notes/patient/:patientId

Get all excuse notes/documents for a patient.

---

### GET /excuse-notes/provider/:providerId

Get all excuse notes/documents for a provider.

---

### GET /excuse-notes/:id

Get a specific excuse note by ID.

---

## Configuration Endpoints

### GET /config/metrics

Get available metrics configuration for dynamic measurement tracking.

**Response:**
```typescript
{
  metrics: Array<{
    id: string;           // e.g., "weight", "sleep_hours", "pain", "bmi"
    label: string;        // Display label
    unit: string;         // e.g., "kg", "hours", "0-10", "bpm"
    input_type: 'numeric' | 'scale' | 'select';
    options?: string[];   // For select type
    min?: number;
    max?: number;
  }>;
}
```

**Example Response:**
```json
{
  "metrics": [
    { "id": "weight", "label": "Weight", "unit": "kg", "input_type": "numeric", "min": 0, "max": 500 },
    { "id": "bmi", "label": "BMI", "unit": "", "input_type": "numeric", "min": 10, "max": 60 },
    { "id": "sleep_hours", "label": "Sleep", "unit": "hours", "input_type": "numeric", "min": 0, "max": 24 },
    { "id": "pain", "label": "Pain Level", "unit": "0-10", "input_type": "scale", "min": 0, "max": 10 },
    { "id": "mood", "label": "Mood", "unit": "", "input_type": "select", "options": ["Excellent", "Good", "Fair", "Poor"] }
  ]
}
```

---

## Patient Vitals Endpoints

### GET /patients/me/vitals

Get current patient's vitals summary (latest readings for all metrics).

**Response:**
```typescript
{
  heartRate?: number;
  spo2?: number;
  respiration?: number;
  systolicBP?: number;
  diastolicBP?: number;
  weight?: number;
  bmi?: number;
  hrv?: number;
  // ... other metrics based on config
}
```

---

### POST /patients/me/vitals

Record a new vital reading.

**Request:**
```typescript
{
  type: string;           // Metric ID from /config/metrics
  value: number | string; // Value based on metric type
  timestamp?: string;     // ISO date string (defaults to now)
  source?: string;        // "MANUAL" | "DEVICE" | "HEALTHKIT"
}
```

---

## Notes

1. All date/time fields are ISO 8601 strings
2. All IDs are UUIDs (v4) or CUIDs
3. Pagination not yet implemented (all endpoints return full results)
4. File uploads are limited to 5 files per message
5. JWT tokens expire after 15 minutes (default)
6. Refresh tokens should be stored securely and used to obtain new access tokens
7. **BMI is critical for GLP-1 medication tracking** - BMI trends determine prescription eligibility and progress monitoring for medications like Ozempic, Wegovy, Mounjaro
8. Measurement types are extensible - use `/config/metrics` to get available metrics dynamically

