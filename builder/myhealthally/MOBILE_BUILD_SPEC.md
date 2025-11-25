# MyHealthAlly Mobile Build Specification
## Native Swift iOS App with WebViews

**Document Version:** 1.0  
**Target Platform:** iOS (Native Swift + WebViews)  
**Backend:** Separate backend service (not using local Express)  
**Content Delivery:** JSON exports from Builder CMS  

---

## 1. DESIGN SYSTEM

### 1.1 Color Palette

**Primary Brand Colors:**
- **Primary Teal**: `#2BA39B` (RGB: 43, 163, 155) - Main CTA, interactive elements
- **Deep Green**: `#0D3B36` (RGB: 13, 59, 54) - Text headings, primary text
- **Cloud White**: `#F9FAFA` (RGB: 249, 250, 250) - Backgrounds, clean surfaces
- **Emerald Accent**: `#2F8F83` (RGB: 47, 143, 131) - Secondary actions
- **Soft Teal Hover**: `#0D8B7C` (RGB: 13, 139, 124) - Hover states

**Neutral Grays:**
- **Slate 50** (Light BG): `#F8FAFC` (RGB: 248, 250, 252)
- **Slate 100**: `#F1F5F9` (RGB: 241, 245, 249)
- **Slate 200**: `#E2E8F0` (RGB: 226, 232, 240)
- **Slate 400**: `#94A3B8` (RGB: 148, 163, 184)
- **Slate 500**: `#64748B` (RGB: 100, 116, 139)
- **Slate 600**: `#475569` (RGB: 71, 85, 105)
- **Slate 700**: `#334155` (RGB: 51, 65, 85)
- **Slate 900** (Dark Text): `#0F172A` (RGB: 15, 23, 42)

**Status Colors:**
- **Success/Green**: `#10B981` (RGB: 16, 185, 129)
- **Warning/Amber**: `#F59E0B` (RGB: 245, 158, 11)
- **Danger/Red**: `#EF4444` (RGB: 239, 68, 68)
- **Info/Blue**: `#3B82F6` (RGB: 59, 130, 246)

### 1.2 Typography

**Font Family:** Inter (fallback: -apple-system, BlinkMacSystemFont, Segoe UI)

**Heading Sizes:**
- **H1:** 32-36px, Weight 700, Line-height 1.2
- **H2:** 24-28px, Weight 600, Line-height 1.3
- **H3:** 20-24px, Weight 600, Line-height 1.4
- **H4:** 16-20px, Weight 600, Line-height 1.5

**Body Text:**
- **Large Body:** 16px, Weight 400, Line-height 1.6
- **Body:** 14px, Weight 400, Line-height 1.6
- **Small:** 12px, Weight 400, Line-height 1.5
- **Label:** 14px, Weight 500, Line-height 1.4

**Weights Available:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### 1.3 Spacing & Layout

**Base Unit:** 4px (all spacing in multiples)
- **XS:** 4px (spacing-1)
- **SM:** 8px (spacing-2)
- **MD:** 12px (spacing-3)
- **LG:** 16px (spacing-4)
- **XL:** 24px (spacing-6)
- **2XL:** 32px (spacing-8)
- **3XL:** 48px (spacing-12)

**Content Max Width:** 1200px (desktop), 100% (mobile)

### 1.4 Corner Radius

- **Compact:** 4px (input fields, badges)
- **Standard:** 6px (cards, buttons)
- **Large:** 12px (large containers, modals)
- **XL:** 24px (hero sections)

### 1.5 Component Guidelines

#### Buttons
- **Primary:** Teal background, white text, 12px padding vertical, 16px horizontal
- **Secondary:** Light teal/slate background, teal text
- **Danger:** Red background, white text
- **Ghost:** Transparent background, teal text, border optional
- **Disabled:** 50% opacity, cursor not-allowed

#### Cards
- **Border:** 1px solid #e2e8f0
- **Border Radius:** 6-8px
- **Padding:** 16-24px
- **Box Shadow:** 0 1px 3px rgba(0,0,0,0.1)
- **Hover Shadow:** 0 4px 6px rgba(0,0,0,0.1)

#### Input Fields
- **Border:** 1px solid #e2e8f0
- **Border Radius:** 6px
- **Padding:** 10px 12px
- **Focus:** Teal border, ring color #2BA39B
- **Placeholder:** Slate 400 (#94a3b8)

#### Badges
- **Padding:** 4px 8px
- **Border Radius:** 4px
- **Font Size:** 12px
- **Font Weight:** 500

---

## 2. FEATURE SPECIFICATIONS & SCREENS

### 2.1 Patient-Facing Screens (24 Total)

#### Authentication Flow
1. **Login** - Email/password authentication
2. **Registration** - First name, last name, DOB, email, password
3. **OTP Verification** - 6-digit code verification
4. **Forgot Password** - Email-based password reset

#### Onboarding
5. **Welcome/Onboarding** - Feature overview, CTA to dashboard

#### Core Patient Features
6. **Patient Dashboard** - Health overview, quick stats, recent appointments, messages
   - Health metrics tiles (heart rate, BP, A1C, BMI)
   - Upcoming appointments
   - Recent messages
   - Quick actions

7. **Patient Intake Form** - Medical history collection
   - Demographics
   - Medical conditions
   - Medications
   - Allergies
   - Family history

8. **Patient Care Plan** - Personalized care goals & instructions
   - Goals and objectives
   - Medications and supplements
   - Activity recommendations
   - Diet guidelines
   - Scheduled checkups

9. **Patient Labs Results** - Lab test results and history
   - Recent results table
   - Result details/document viewer
   - Historical trends
   - Download/share options

10. **Patient Appointments** - Booking and viewing appointments
    - Upcoming appointments list
    - Past visits
    - Book appointment CTA
    - Appointment details (provider, time, location)

11. **Patient Vitals Trends** - Vital signs monitoring and charts
    - Line charts (heart rate, BP, etc.)
    - Date range selector
    - Export data option
    - Goals/target ranges

#### Health Tracking
12. **Patient Health Metrics** - Daily metrics input and tracking
    - Weight, height, BMI
    - Blood pressure
    - Heart rate
    - A1C level
    - Date/time picker

13. **Patient Medications** - Current medications list
    - Medication name, dosage, frequency
    - Refill status
    - Side effects tracking
    - Medication interactions

14. **Patient Health Journal** - Personal health notes
    - Symptom tracking
    - Note creation/editing
    - Mood tracking
    - Searchable entries

15. **Patient Voice Log & Notes** - Audio/voice notes
    - Record voice note
    - Transcription (if available)
    - Timestamp
    - Edit/delete options

#### Communication
16. **Patient Messaging** - Direct messaging with clinicians
    - Conversation list
    - Message threads
    - Unread badge
    - Send message form

17. **Patient Notifications Center** - All alerts and notifications
    - Appointment reminders
    - Lab result alerts
    - Medication reminders
    - Care plan updates
    - Mark as read/unread

#### Resources & Support
18. **Patient Resources & Education** - Health education content
    - Articles and guides
    - Videos
    - Search functionality
    - Bookmarking

19. **Patient FAQs** - Frequently asked questions
    - Searchable Q&A
    - Categories
    - Related articles

20. **Patient Support Page** - Help and support resources
    - Contact support form
    - FAQ links
    - Emergency numbers
    - Live chat option

#### Administrative
21. **Patient Settings** - Account and preference settings
    - Profile editing
    - Password change
    - Privacy settings
    - Notification preferences
    - Data export

22. **Patient Billing & Payments** - Invoice and payment management
    - Invoice history
    - Payment methods
    - Make payment
    - Download receipts

23. **Patient Payment Method** - Add/edit payment information
    - Card details form
    - Billing address
    - Set as default

24. **Patient Insurance Info** - Insurance details
    - Insurance provider
    - Member ID
    - Group number
    - Upload ID card photo

#### Advanced Features
25. **Patient Emergency Info** - Emergency contact management
    - Emergency contacts list
    - Medical alerts
    - DNR status
    - Allergies (critical)

26. **Patient Device Integrations** - Connect health devices
    - Wearable device list
    - Connection status
    - Data sync status
    - Disconnect options

27. **Patient AI Assistant** - Chat with health AI
    - Symptom checker
    - Medication info lookup
    - Health question answering

28. **Patient Visit Summary** - Post-visit notes and summary
    - Visit date and provider
    - Diagnosis
    - Treatment plan
    - Prescriptions issued
    - Next steps

29. **Patient Walk-In Request** - Request urgent walk-in visit
    - Reason for visit
    - Preferred date/time
    - Location selector
    - Submit and confirmation

### 2.2 Clinician-Facing Screens (React-based, some may use WebView)

1. **Clinician Dashboard** - Overview of patient panel
   - Patient count, appointment count, pending items
   - Quick alerts
   - Today's schedule
   - Recent activities

2. **Clinician Patient List** - All assigned patients
   - Patient search/filter
   - Risk/status indicators
   - Quick actions per patient

3. **Clinician Patient Detail** - Detailed patient view
   - Demographics and contact
   - Medical history
   - Current medications
   - Vital signs trends
   - Care plan
   - Communication options

4. **Clinician Care Plan Editor** - Create/edit care plans
   - Goals editor
   - Medication management
   - Instructions and recommendations
   - Save and publish

5. **Clinician Alerts & Triage** - Manage patient alerts
   - Alert queue
   - Severity levels
   - Quick assessment
   - Action items

6. **Clinician Visit Requests & Queue** - Manage visit requests
   - Pending requests
   - Scheduled visits
   - Virtual visit setup

7. **Clinician Virtual Visit** - Video/telehealth interface
   - Video call component
   - Patient info sidebar
   - Notes during visit
   - Prescription interface

---

## 3. API DOCUMENTATION

### 3.1 Base Configuration

**Base URL:** `{backend_service_url}`  
**Authentication:** Bearer token in Authorization header  
**Content-Type:** application/json  

### 3.2 Authentication Endpoints

#### POST /api/auth/register
Register new patient account
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "password": "string"
}
```
Response:
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "token": "jwt_token",
  "refreshToken": "string"
}
```

#### POST /api/auth/login
Login with credentials
```json
{
  "email": "string",
  "password": "string"
}
```
Response:
```json
{
  "token": "jwt_token",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "patient|clinician"
  }
}
```

#### POST /api/auth/verify-otp
Verify OTP code
```json
{
  "email": "string",
  "code": "string"
}
```

#### POST /api/auth/refresh
Refresh access token
```json
{
  "refreshToken": "string"
}
```

#### POST /api/auth/forgot-password
Request password reset
```json
{
  "email": "string"
}
```

#### POST /api/auth/reset-password
Reset password with token
```json
{
  "token": "string",
  "newPassword": "string"
}
```

### 3.3 Patient Data Endpoints

#### GET /api/patients/:patientId/dashboard
Get patient dashboard data
Response:
```json
{
  "patientId": "string",
  "name": "string",
  "lastUpdated": "ISO8601",
  "metrics": {
    "heartRate": { "value": 72, "unit": "bpm", "status": "normal" },
    "bloodPressure": { "systolic": 120, "diastolic": 80, "unit": "mmHg", "status": "normal" },
    "bloodGlucose": { "value": 95, "unit": "mg/dL", "status": "normal" },
    "a1cLevel": { "value": 5.8, "unit": "%", "status": "normal" },
    "weight": { "value": 70, "unit": "kg", "status": "normal" },
    "bmi": { "value": 24.1, "unit": "kg/m²", "status": "normal" }
  },
  "upcomingAppointments": [
    {
      "id": "string",
      "date": "ISO8601",
      "time": "HH:MM",
      "provider": "string",
      "type": "video|in-person|phone"
    }
  ],
  "recentMessages": [
    {
      "id": "string",
      "from": "string",
      "preview": "string",
      "timestamp": "ISO8601",
      "unread": false
    }
  ]
}
```

#### GET /api/patients/:patientId/vitals
Get vital signs history
```json
{
  "vitals": [
    {
      "id": "string",
      "timestamp": "ISO8601",
      "heartRate": 72,
      "bloodPressureSystolic": 120,
      "bloodPressureDiastolic": 80,
      "temperature": 37,
      "respiratoryRate": 16
    }
  ]
}
```

#### POST /api/patients/:patientId/vitals
Log new vital signs
```json
{
  "heartRate": 72,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "temperature": 37,
  "respiratoryRate": 16,
  "timestamp": "ISO8601"
}
```

#### GET /api/patients/:patientId/labs
Get lab results
Response:
```json
{
  "results": [
    {
      "id": "string",
      "testName": "string",
      "date": "ISO8601",
      "status": "normal|abnormal|critical",
      "results": {
        "a1c": 5.8,
        "glucose": 95,
        "creatinine": 1.0
      },
      "documentUrl": "string"
    }
  ]
}
```

#### GET /api/patients/:patientId/care-plan
Get current care plan
Response:
```json
{
  "id": "string",
  "patientId": "string",
  "createdDate": "ISO8601",
  "updatedDate": "ISO8601",
  "status": "active|inactive",
  "goals": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "targetDate": "ISO8601",
      "status": "in-progress|completed|abandoned"
    }
  ],
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "instructions": "string"
    }
  ],
  "activityRecommendations": [
    {
      "type": "string",
      "frequency": "string",
      "duration": "string",
      "intensity": "light|moderate|vigorous"
    }
  ],
  "dietaryGuidelines": [
    {
      "guideline": "string",
      "rationale": "string"
    }
  ]
}
```

#### GET /api/patients/:patientId/medications
Get medication list
Response:
```json
{
  "medications": [
    {
      "id": "string",
      "name": "string",
      "dosage": "string",
      "unit": "mg|mcg|g",
      "frequency": "once daily|twice daily",
      "refillStatus": "available|refill-requested|out-of-stock",
      "prescribedDate": "ISO8601",
      "refillDate": "ISO8601",
      "sideEffects": ["string"]
    }
  ]
}
```

#### GET /api/patients/:patientId/appointments
Get appointments
Response:
```json
{
  "upcoming": [
    {
      "id": "string",
      "date": "ISO8601",
      "time": "HH:MM",
      "provider": "string",
      "type": "video|in-person|phone",
      "status": "scheduled|cancelled|completed",
      "location": "string"
    }
  ],
  "past": [
    {
      "id": "string",
      "date": "ISO8601",
      "time": "HH:MM",
      "provider": "string",
      "summaryUrl": "string"
    }
  ]
}
```

#### POST /api/patients/:patientId/appointments
Book appointment
```json
{
  "providerId": "string",
  "preferredDate": "YYYY-MM-DD",
  "preferredTime": "HH:MM",
  "type": "video|in-person|phone",
  "reason": "string"
}
```

#### GET /api/patients/:patientId/messages
Get message threads
Response:
```json
{
  "threads": [
    {
      "id": "string",
      "participantName": "string",
      "participantRole": "clinician|nurse|admin",
      "lastMessage": "string",
      "lastMessageTime": "ISO8601",
      "unreadCount": 0
    }
  ]
}
```

#### GET /api/patients/:patientId/messages/:threadId
Get message thread
Response:
```json
{
  "threadId": "string",
  "messages": [
    {
      "id": "string",
      "from": "string",
      "fromRole": "patient|clinician",
      "text": "string",
      "timestamp": "ISO8601",
      "read": true
    }
  ]
}
```

#### POST /api/patients/:patientId/messages/:threadId
Send message
```json
{
  "text": "string"
}
```

#### GET /api/patients/:patientId/notifications
Get notifications
Response:
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "appointment|lab|medication|care-plan|message",
      "title": "string",
      "message": "string",
      "timestamp": "ISO8601",
      "read": false,
      "actionUrl": "string"
    }
  ]
}
```

#### PUT /api/patients/:patientId/notifications/:notificationId/read
Mark notification as read

#### GET /api/patients/:patientId/settings
Get patient settings
Response:
```json
{
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "profilePhotoUrl": "string"
  },
  "preferences": {
    "notificationsEnabled": true,
    "emailNotifications": true,
    "smsNotifications": true,
    "appointmentReminders": true,
    "medicationReminders": true
  },
  "privacy": {
    "shareDataWithProviders": true,
    "shareWithResearch": false
  }
}
```

#### PUT /api/patients/:patientId/settings
Update patient settings
Same structure as GET response

#### GET /api/patients/:patientId/journal
Get health journal entries
Response:
```json
{
  "entries": [
    {
      "id": "string",
      "date": "ISO8601",
      "title": "string",
      "content": "string",
      "mood": "excellent|good|fair|poor",
      "symptoms": ["string"],
      "tags": ["string"]
    }
  ]
}
```

#### POST /api/patients/:patientId/journal
Create journal entry
```json
{
  "title": "string",
  "content": "string",
  "mood": "excellent|good|fair|poor",
  "symptoms": ["string"],
  "date": "ISO8601"
}
```

#### GET /api/patients/:patientId/intake-form
Get intake form data
Response:
```json
{
  "demographics": {
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "M|F|Other",
    "phone": "string"
  },
  "medicalHistory": {
    "conditions": ["string"],
    "surgeries": ["string"],
    "allergies": ["string"],
    "medications": ["string"],
    "familyHistory": ["string"]
  },
  "socialHistory": {
    "smoking": "never|former|current",
    "alcohol": "never|occasional|regular",
    "exercise": "none|light|moderate|vigorous"
  }
}
```

#### POST /api/patients/:patientId/intake-form
Submit intake form
Same structure as GET response

---

## 4. JSON EXPORT STRUCTURE (Builder CMS)

### 4.1 Patient Page Export Format

When exporting patient pages from Builder CMS as JSON:

```json
{
  "id": "content_id",
  "name": "Patient Dashboard",
  "modelName": "patient-dashboard",
  "published": true,
  "data": {
    "title": "My Health Dashboard",
    "patientId": "P001",
    "blocks": [
      {
        "type": "section",
        "id": "section_1",
        "properties": {
          "style": {
            "display": "flex",
            "flexDirection": "column",
            "backgroundColor": "#f9fafa",
            "padding": "24px"
          }
        },
        "children": [
          {
            "type": "div",
            "properties": {
              "style": {
                "maxWidth": "1200px",
                "margin": "0 auto",
                "width": "100%"
              }
            },
            "children": [
              {
                "type": "h1",
                "properties": {
                  "style": {
                    "fontSize": "32px",
                    "fontWeight": "600",
                    "color": "#0D3B36",
                    "marginBottom": "8px"
                  }
                },
                "children": ["Welcome back, Sarah"]
              },
              {
                "type": "p",
                "properties": {
                  "style": {
                    "fontSize": "14px",
                    "color": "#64748b",
                    "marginBottom": "24px"
                  }
                },
                "children": ["Last updated: January 15, 2024"]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 4.2 Building Pages with WebViews

For mobile WebView integration:

1. **Separate HTML files** per patient screen
2. **Use responsive CSS** (mobile-first approach)
3. **Minimize JavaScript** (data binding only)
4. **Export structured JSON** with block elements
5. **Include navigation metadata** for routing

Example WebView-ready export:
```json
{
  "screen": "patient-dashboard",
  "title": "My Dashboard",
  "navigation": {
    "back": "/dashboard",
    "next": null,
    "breadcrumbs": [
      { "label": "Home", "path": "/" },
      { "label": "Dashboard", "path": "/dashboard" }
    ]
  },
  "data": {
    "blocks": [...],
    "dataBindings": {
      "userName": "string",
      "metrics": "object",
      "appointments": "array"
    }
  }
}
```

---

## 5. ARCHITECTURE OVERVIEW

### 5.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Native iOS Swift App                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  WebView Container                                       │ │
│  │  (Patient screens rendered from HTML/JSON)              │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React Components (Clinician screens)                   │ │
│  │  (Via WKWebView or native bridging)                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Native Layer                                            │ │
│  │  - Device access (camera, microphone, sensors)          │ │
│  │  - Biometric auth (Face ID, Touch ID)                   │ │
│  │  - Local storage                                         │ │
│  │  - Push notifications                                    │ │
│  └───────────────────────────────────────────────────────���─┘ │
└─────────────────────────────────────────────────────────────┘
         │
         ├── REST API calls
         └── Authentication tokens
         
┌─────────────────────────────────────────────────────────────┐
│               Backend Service (Your Service)                  │
│  - Authentication & authorization                            │
│  - Patient data management                                    │
│  - Clinician operations                                       │
│  - Database & business logic                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Builder CMS (Content)                        │
│  - Patient screen templates (24 pages)                        │
│  - JSON exports for WebView rendering                         │
│  - Content versioning                                         │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow

1. **Authentication:**
   - User enters credentials in native login screen
   - POST `/api/auth/login` to backend
   - Receive JWT token + refresh token
   - Store tokens in secure keychain
   - Set Bearer token for all subsequent requests

2. **Patient Data:**
   - Request patient data via REST API
   - Load patient screen JSON from Builder CMS
   - Render in WebView with native bridge for interactions
   - Cache responses locally for offline capability

3. **Real-time Updates:**
   - Use WebSockets or polling for real-time data
   - Push notifications via APNs
   - Refresh screens on foreground

### 5.3 File Organization for Mobile

**Suggested directory structure:**
```
ios/
├── MyHealthAlly/
│   ├── Views/
│   │   ├── Auth/
│   │   │   ├── LoginViewController.swift
│   │   │   ├── RegisterViewController.swift
│   │   │   └── OTPVerificationViewController.swift
│   │   ├── Patient/
│   │   │   ├── PatientWebViewController.swift
│   │   │   ├── DashboardViewController.swift
│   │   │   └── TabBarViewController.swift
│   │   ├── Clinician/
│   │   │   └── ClinicianViewController.swift (if native)
│   │   └── Common/
│   │       └── BaseViewController.swift
│   ├── ViewModels/
│   │   ├── AuthViewModel.swift
│   │   ├── PatientViewModel.swift
│   │   └── APIViewModel.swift
│   ├── Services/
│   │   ├── APIService.swift
│   │   ├── AuthService.swift
│   │   ├── KeychainService.swift
│   │   └── WebViewService.swift
│   ├── Models/
│   │   ├── Patient.swift
│   │   ├── Appointment.swift
│   │   ├── Vital.swift
│   │   └── APIModels.swift
│   ├── Utils/
│   │   ├── Constants.swift
│   │   ├── Extensions.swift
│   │   └── URLBuilder.swift
│   └── App/
│       ├── SceneDelegate.swift
│       └── AppDelegate.swift
```

---

## 6. AUTHENTICATION FLOW

### 6.1 Initial Login

1. User launches app
2. Check if token exists in Keychain
3. If valid token: Skip to Dashboard
4. If no token: Show Login screen
5. User enters email + password
6. POST to `/api/auth/login`
7. Receive `token` + `refreshToken`
8. Store in Keychain (encrypted)
9. Navigate to Dashboard

### 6.2 Token Refresh

1. When API call fails with 401
2. POST to `/api/auth/refresh` with refreshToken
3. Receive new token
4. Retry original request
5. If refresh fails: Force logout, return to Login

### 6.3 Logout

1. Delete tokens from Keychain
2. Clear WebView cache
3. Navigate to Login screen

---

## 7. WEBVIEW INTEGRATION

### 7.1 Loading Patient Screens

```swift
// Pseudo-code example for iOS
let htmlString = generateHTMLFromJSON(builderContent)
webView.loadHTMLString(htmlString, baseURL: nil)

// Or load from URL
if let url = URL(string: "https://app.example.com/patient/dashboard") {
    let request = URLRequest(url: url)
    webView.load(request)
}
```

### 7.2 Native Bridge (JavaScript ↔ Swift)

```swift
// Swift: Handle calls from JavaScript
webView.configuration.userContentController.add(
    self,
    name: "nativeApp"
)

// Handle message:
func userContentController(
    _ userContentController: WKUserContentController,
    didReceive message: WKScriptMessage
) {
    if message.name == "nativeApp" {
        if let data = message.body as? [String: Any],
           let action = data["action"] as? String {
            switch action {
            case "logout":
                logout()
            case "goTo":
                if let screen = data["screen"] as? String {
                    navigateTo(screen)
                }
            default:
                break
            }
        }
    }
}
```

```javascript
// JavaScript: Call native code from WebView
window.webkit.messageHandlers.nativeApp.postMessage({
    action: "logout"
})
```

### 7.3 Handling Forms

1. Forms in WebView POST to backend
2. Swift intercepts request via WKNavigationDelegate
3. Show native loading indicator
4. Update UI based on response
5. Or allow WebView to handle (recommended for simplicity)

---

## 8. OFFLINE CAPABILITY

1. **Cache API responses** locally using CoreData
2. **Detect network status** with Network framework
3. **Queue requests** when offline
4. **Sync when reconnected** automatically
5. **Show offline indicator** in UI

---

## 9. SECURITY CONSIDERATIONS

1. **Store tokens in Keychain** (not UserDefaults)
2. **Use HTTPS only** for all API calls
3. **Implement certificate pinning** for sensitive endpoints
4. **Validate all WebView inputs**
5. **Don't log sensitive data**
6. **Implement app transport security**
7. **Use Face ID/Touch ID** for biometric auth
8. **Expire tokens appropriately**

---

## 10. PERFORMANCE NOTES

1. **Lazy load images** in WebViews
2. **Minimize JSON payloads**
3. **Cache frequently accessed data**
4. **Use native navigation** for smoother UX
5. **Optimize WebView memory usage**
6. **Preload critical screens**
7. **Implement pagination** for lists

---

## 11. DELIVERABLES CHECKLIST FOR CLAUDE

- [ ] Native authentication flow (login, register, OTP, password reset)
- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] WebView container for patient screens
- [ ] JSON parsing and HTML generation from Builder CMS exports
- [ ] API service layer with proper error handling
- [ ] Token management (storage, refresh, expiration)
- [ ] Navigation between screens
- [ ] Offline data caching
- [ ] Push notification handling
- [ ] Settings and preferences screen
- [ ] Local data backup and export
- [ ] TestFlight beta build

---

**Questions or clarifications needed?** Contact the backend team for API specifications or the design team for visual assets.
