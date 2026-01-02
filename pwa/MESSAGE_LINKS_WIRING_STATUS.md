# Message Links Wiring Status - Solopractice Integration

## ✅ All Message Links Are Wired to Solopractice

### Core Message Pages (All Wired)

1. **`/messages/new`** - New Message Page
   - ✅ **Wired to Solopractice**: Uses `sendMessageToSolopractice()` 
   - ✅ **API Endpoint**: `POST /api/portal/messages/threads/{id}/messages`
   - ✅ **Features**:
     - Language detection and translation
     - Thread creation/retrieval
     - Status handling (sent, deferred, blocked)
     - Query parameter support for pre-filling form
   - ✅ **Query Parameters Supported**:
     - `recipient`: Pre-selects recipient (care-team, billing, etc.)
     - `subject`: Pre-fills subject line
     - `context`: Pre-fills message context

2. **`/messages/[id]`** - Message Detail/Reply Page
   - ✅ **Wired to Solopractice**: Uses `apiClient.getThreadMessages()` and `sendMessageToSolopractice()`
   - ✅ **API Endpoints**:
     - `GET /api/portal/messages/threads/{id}` - Load messages
     - `POST /api/portal/messages/threads/{id}/messages` - Send reply
   - ✅ **Features**: Loads thread messages, sends replies, handles all status responses

3. **`/messages`** - Messages List Page
   - ✅ **Wired to Solopractice**: Uses `apiClient.getThreads()`
   - ✅ **API Endpoint**: `GET /api/portal/messages/threads`
   - ✅ **Features**: Lists all message threads, shows last message preview

### Context-Aware Links (All Wired with Pre-filled Context)

4. **Lab Results - Detail Page** (`/labs/[id]`)
   - ✅ **Link**: "Ask About Results" button
   - ✅ **Route**: `/messages/new?recipient=care-team&subject=Question about Lab Results&context=lab results`
   - ✅ **Wired**: Routes to `/messages/new` which is fully wired to Solopractice

5. **Lab Results - List Page** (`/labs`)
   - ✅ **Link 1**: "message your care team" text link
   - ✅ **Route**: `/messages/new?recipient=care-team&subject=Question about Lab Results&context=lab results`
   - ✅ **Link 2**: "Message Your Care Team" button (when no results)
   - ✅ **Route**: `/messages/new?recipient=care-team&subject=Question about Lab Results&context=lab results`
   - ✅ **Wired**: Both routes to `/messages/new` which is fully wired to Solopractice

6. **Billing Page** (`/billing`)
   - ✅ **Link**: "Message Billing" button
   - ✅ **Route**: `/messages/new?recipient=billing&subject=Question about Billing&context=billing`
   - ✅ **Wired**: Routes to `/messages/new` which is fully wired to Solopractice

7. **Messages Page - Empty State** (`/messages`)
   - ✅ **Link**: "Send your first message" button
   - ✅ **Route**: `/messages/new` (no query params - user fills form manually)
   - ✅ **Wired**: Routes to `/messages/new` which is fully wired to Solopractice

8. **Messages Page - With Messages** (`/messages`)
   - ✅ **Link**: "New Message" button
   - ✅ **Route**: `/messages/new` (no query params - user fills form manually)
   - ✅ **Wired**: Routes to `/messages/new` which is fully wired to Solopractice

## 🔌 Solopractice API Integration Details

### Message Helper Functions (`lib/api/message-helpers.ts`)

All message sending goes through these functions:

1. **`syncAuthTokensToApiClient()`**
   - Syncs auth tokens from Zustand store to API client
   - Called before every API request

2. **`getOrCreateDefaultThread()`**
   - Retrieves existing message threads
   - Returns most recent thread ID or null

3. **`sendMessageToSolopractice()`**
   - Main function for sending messages
   - Handles thread creation/retrieval
   - Sends to: `POST /api/portal/messages/threads/{id}/messages`
   - Includes language detection

4. **`handleMessageStatus()`**
   - Processes API response status
   - Returns user-friendly messages
   - Handles: `sent`, `after_hours_deferred`, `blocked`

### API Client (`lib/api/solopractice-client.ts`)

- **`getThreads()`**: Fetches all message threads
- **`getThreadMessages(threadId)`**: Fetches messages in a thread
- **`sendMessage(threadId, request)`**: Sends a message to a thread
- **`markMessageAsRead(messageId)`**: Marks message as read (available but not yet used in UI)

## ✅ Verification Checklist

- [x] All message links route to `/messages/new` or `/messages/[id]`
- [x] `/messages/new` is wired to Solopractice API
- [x] `/messages/[id]` is wired to Solopractice API
- [x] `/messages` is wired to Solopractice API
- [x] Context-aware links pre-fill form with query parameters
- [x] All links use proper authentication token sync
- [x] Error handling is implemented for all API calls
- [x] User feedback is provided for all message statuses
- [x] Language detection and translation is integrated
- [x] Thread creation/retrieval is handled automatically

## 📋 Message Flow

1. **User clicks link** (e.g., "Ask About Results" from labs page)
2. **Navigation** → `/messages/new?recipient=care-team&subject=Question about Lab Results&context=lab results`
3. **Form pre-fills** → Recipient, subject, and message context are populated
4. **User completes form** → Adds their specific question
5. **Submit** → `handleSubmit()` calls `sendMessageToSolopractice()`
6. **Token sync** → `syncAuthTokensToApiClient()` ensures auth tokens are current
7. **Thread retrieval** → `getOrCreateDefaultThread()` gets or creates thread
8. **API call** → `apiClient.sendMessage()` sends to Solopractice
9. **Status handling** → `handleMessageStatus()` processes response
10. **User feedback** → Success, deferred, or blocked message shown
11. **Navigation** → User redirected to `/messages` to see their message

## 🎯 All Links Verified and Wired

**Status: ✅ COMPLETE**

All message links from MHA are properly wired to Solopractice API endpoints. The integration includes:
- Context-aware pre-filling via query parameters
- Proper authentication token handling
- Comprehensive error handling
- User-friendly status messages
- Language detection and translation

No additional wiring needed. All links are functional and connected to Solopractice.

