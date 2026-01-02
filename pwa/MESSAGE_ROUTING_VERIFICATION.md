# Message Routing Verification - MHA to Solopractice

## ✅ Message Routing Implementation

### Translation Note
**Important**: All messages sent TO Solopractice are translated to English first, even if the patient typed/spoke in a foreign language. Messages received FROM Solopractice are translated to the patient's preferred language when displayed. See `MESSAGE_TRANSLATION_FLOW.md` for details.

### Current Flow

```
Patient selects recipient in MHA
    ↓
Form includes: recipient, subject, message
    ↓
sendMessageToSolopractice() called with:
  - body: message content
  - subject: message subject
  - recipient: 'care-team' | 'billing' | 'nurse' | 'dr-smith' | 'scheduling'
  - category: mapped from recipient ('general' | 'billing' | 'clinical' | 'scheduling')
    ↓
POST /api/portal/messages/threads/{id}/messages
  Payload includes:
    - body
    - subject
    - recipient
    - category
    - detected_language
    ↓
Solopractice receives message with routing information
    ↓
Solopractice routes to appropriate mailbox/person:
  - 'care-team' → General care team inbox
  - 'billing' → Billing department
  - 'nurse' → Nursing staff
  - 'dr-smith' → Dr. Smith's inbox
  - 'scheduling' → Scheduling department
    ↓
Message appears in correct mailbox in Solopractice
```

## 📋 Recipient Mapping

| MHA Recipient | Category | Solopractice Routing |
|--------------|----------|---------------------|
| `care-team` | `general` | General care team inbox |
| `md-{clinicianId}` | `clinical` | Primary MD's inbox (dynamically loaded from patient's primary_clinician_id) |
| `nurse` | `clinical` | Nursing staff inbox |
| `billing` | `billing` | Billing department |
| `scheduling` | `scheduling` | Scheduling department |

## 🔌 API Payload Structure

### SendMessageRequest (Updated)

```typescript
{
  body: string;                    // Message content
  subject?: string;                // Message subject
  recipient?: string;               // 'care-team' | 'billing' | 'nurse' | 'md-{clinicianId}' | 'scheduling'
  category?: string;               // 'general' | 'billing' | 'clinical' | 'scheduling'
  detected_language?: string;       // Language detected from input
  preferred_language?: string;      // Patient's preferred language
  symptom_screen?: SymptomScreenResult;
  attachments?: Record<string, unknown>;
}
```

## ✅ Implementation Details

### 1. Message Form (`app/messages/new/page.tsx`)
- ✅ Collects recipient selection from user
- ✅ Passes recipient to `sendMessageToSolopractice()`
- ✅ Pre-fills recipient from query parameters (context-aware links)

### 2. Message Helper (`lib/api/message-helpers.ts`)
- ✅ Accepts `recipient` parameter
- ✅ Maps recipient to category for routing
- ✅ Includes recipient and category in API request
- ✅ Handles thread creation/retrieval

### 3. API Client (`lib/api/solopractice-client.ts`)
- ✅ `SendMessageRequest` interface includes recipient and category
- ✅ Sends complete routing information to Solopractice

### 4. Reply Messages (`app/messages/[id]/page.tsx`)
- ✅ Replies use existing thread (no recipient needed)
- ✅ Thread already has routing information from original message

## 🔄 Synchronization

### MHA → Solopractice
- ✅ Recipient information included in message payload
- ✅ Category automatically mapped from recipient
- ✅ Subject line included for organization
- ✅ Thread ID ensures messages stay in same conversation

### Solopractice → MHA
- ✅ Messages received via webhook (`/api/patient/message`)
- ✅ Thread synchronization via `GET /api/portal/messages/threads`
- ✅ Message list syncs when user opens messages page

## 🎯 Verification Checklist

- [x] Recipient information collected in form
- [x] Recipient passed to API helper function
- [x] Recipient included in API request payload
- [x] Category mapped from recipient
- [x] Subject line included for routing
- [x] Thread creation/retrieval works
- [x] Replies maintain thread context
- [x] Context-aware links pre-fill recipient

## 📝 Notes

1. **Thread Routing**: When a new thread is created, Solopractice uses the recipient/category from the first message to route it to the appropriate mailbox.

2. **Reply Routing**: Replies use the existing thread, so they automatically go to the same mailbox as the original message.

3. **Context-Aware Links**: Links from labs, billing, etc. automatically pre-fill the recipient, ensuring messages go to the right place.

4. **Category Mapping**: The category field provides additional routing context to Solopractice for proper mailbox assignment.

## ✅ Status: COMPLETE

All messages sent from MHA now include recipient and category information, ensuring they are routed to the correct mailbox/person in Solopractice. The two systems are properly synchronized.

