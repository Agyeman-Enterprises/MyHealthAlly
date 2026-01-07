# AI Assistant Implementation - WebMD-Style

## Overview

Implemented a WebMD-style interactive AI health assistant that provides instant answers to health questions, similar to WebMD's HealthInteractive and Spark Virtual Assistant features.

## Key Features

### 1. **Interactive Chat Interface**
- Real-time conversational AI assistant
- Chat-based UI similar to WebMD's assistant
- Conversation history maintained for context
- Suggested follow-up questions

### 2. **Rate Limiting & Caching**
- **In-memory caching** (5-minute TTL) to prevent throttling
- **Rate limiting** (10 requests per minute per user)
- Automatic cache cleanup to manage memory
- Prevents API throttling issues

### 3. **WebMD-Style Boundaries**
- Provides general health information and education
- Can discuss conditions, symptoms, and treatments in general terms
- Does not provide personalized diagnoses or prescriptions
- Includes appropriate disclaimers
- Similar to WebMD's HealthInteractive assistant

### 4. **User Experience**
- Voice input support
- Suggested questions based on conversation
- Loading states and error handling
- Mobile-responsive design

## Implementation Details

### Files Created

1. **`pwa/lib/services/ai-chat-service.ts`**
   - Core chat service with Anthropic Claude integration
   - Rate limiting and caching logic
   - Minimal response filtering (only blocks direct personal diagnoses/prescriptions)
   - Suggested question generation

2. **`pwa/lib/services/ai-conversation-service.ts`**
   - Conversation persistence service
   - Save/load conversations from database
   - Conversation management (create, load, delete)

3. **`pwa/app/api/ai-chat/route.ts`**
   - API endpoint for chat requests (POST)
   - API endpoint for loading conversations (GET)
   - Handles conversation persistence
   - Multi-language translation support
   - Error handling and rate limit responses

4. **`pwa/components/ai/AIChatAssistant.tsx`**
   - React component for chat UI
   - Message display and input handling
   - Voice input integration
   - Suggested questions UI
   - Conversation history loading

5. **`pwa/app/ai-assistant/page.tsx`**
   - Full-page route for AI assistant
   - Integrated with app layout and navigation

6. **`pwa/supabase/migrations/011_ai_chat_conversations.sql`**
   - Database schema for conversations and messages
   - RLS policies for security
   - Indexes for performance

7. **`pwa/app/hospital-records-request/page.tsx`**
   - Page for authorizing care team to send medication/allergy history to hospitals
   - Automatically loads and displays patient's current medications and allergies
   - Sends authorization request with complete medical history to care team
   - Supports emergency, inpatient, and outpatient visit types

8. **`pwa/app/documents/upload/page.tsx`** (Enhanced)
   - Added "Discharge Summary" as document type
   - Special instructions for discharge summary uploads
   - Documents can be uploaded for provider review

### How It Works

1. **User sends a message** → Frontend sends to `/api/ai-chat`
2. **Message translated to English** → For optimal AI performance
3. **API gets/creates conversation** → Loads or creates conversation in database
4. **API loads conversation history** → Retrieves previous messages for context
5. **API checks rate limit** → Prevents abuse and throttling
6. **API checks cache** → Returns cached response if available
7. **API calls Anthropic Claude** → Generates response with conversation context
8. **Response filtered** → Only blocks direct personal diagnoses/prescriptions (like WebMD)
9. **Response translated** → Back to user's preferred language
10. **Messages saved** → Both user message and AI response saved to database
11. **Response returned** → With suggested follow-up questions and conversation ID

### Rate Limiting Strategy

- **Per-user rate limiting**: 10 requests per minute
- **Caching**: 5-minute TTL for similar questions
- **Cache size limit**: 100 entries (auto-cleanup)
- **User identification**: By user ID, IP address, or anonymous

### Comparison to WebMD

| Feature | WebMD | MyHealthAlly |
|--------|-------|--------------|
| Interactive Chat | ✅ | ✅ |
| Instant Answers | ✅ | ✅ |
| Conversation History | ✅ | ✅ |
| Suggested Questions | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ |
| Caching | ✅ | ✅ |
| Voice Input | ❌ | ✅ |
| R9 Compliance | N/A | ✅ |

## Usage

### Access the Assistant

1. **From Dashboard**: Click "AI Assistant" card
2. **Direct URL**: Navigate to `/ai-assistant`
3. **Quick Access**: Featured at top of dashboard

### Example Questions

- "What is high blood pressure?"
- "How can I track my symptoms?"
- "What should I know about my medications?"
- "When should I contact my care team?"

## Technical Notes

### Caching Strategy

- Cache key based on message content + recent conversation history
- Prevents duplicate API calls for similar questions
- Reduces costs and improves response time

### Rate Limiting

- In-memory rate limiting (per user/IP)
- In production, consider Redis for distributed rate limiting
- Configurable limits (currently 10/min)

### Error Handling

- Graceful fallback on API errors
- User-friendly error messages
- Rate limit exceeded → 429 status with clear message

## ✅ Implemented Features

1. **✅ Persistent Conversation History**: Conversations are stored in database
   - Messages persist across sessions
   - Conversation history loads automatically
   - Each user has their own conversation threads

2. **✅ Multi-language Support**: Full translation support
   - User questions translated to English for AI
   - AI responses translated back to user's preferred language
   - Supports any language via translation API
   - Original and translated content stored for reference

## ✅ Additional Features Implemented

1. **✅ Send Conversation to Care Team**: Users can send their AI conversation to their care team
   - "Send to Care Team" button appears in chat header when conversation has messages
   - Conversation is formatted and translated to English for care team
   - Sent via messaging system to care team inbox

2. **✅ Hospital/ED Records Request**: Patients can authorize sending medication/allergy history to hospitals
   - New page: `/hospital-records-request`
   - Automatically loads patient's current medications and allergies
   - Patient authorizes care team to send this information to hospital/ED
   - Includes complete medication history and allergy information

3. **✅ Discharge Summary Upload**: Enhanced document upload for discharge summaries
   - "Discharge Summary" added as document type
   - Special instructions shown when discharge summary is selected
   - Documents uploaded for provider review and record updates

## Future Enhancements

1. **Conversation List**: Show all previous conversations
2. **Advanced Caching**: Redis for production scale
3. **Analytics**: Track popular questions and responses
4. **Export Conversations**: Allow users to export their chat history

## WebMD-Style Boundaries

The AI assistant provides:
- ✅ General health information and education
- ✅ Discussion of conditions, symptoms, and treatments in general terms
- ✅ Educational content about medications and treatments
- ✅ Appropriate disclaimers about consulting healthcare providers

The AI assistant does NOT:
- ❌ Provide personalized diagnoses
- ❌ Prescribe specific medications or treatments
- ❌ Give personalized medical advice

Similar to WebMD's approach - informative but not diagnostic.

## Testing

To test the assistant:
1. Navigate to `/ai-assistant`
2. Ask health-related questions (e.g., "What is high blood pressure?", "What are common symptoms of flu?")
3. Verify responses provide informative health information
4. Verify responses include appropriate disclaimers
5. Check rate limiting by sending multiple requests quickly
6. Verify caching by asking the same question twice

## Configuration

### Required Environment Variables

```bash
# AI Service
ANTHROPIC_API_KEY=your_key_here

# Translation Service (for multi-language support)
TRANSLATE_API_URL=https://your-translation-api.com/translate
TRANSLATE_API_KEY=your_translation_api_key

# Supabase (for conversation persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Migration

Run the migration to create the conversation tables:
```bash
# The migration file is at: pwa/supabase/migrations/011_ai_chat_conversations.sql
# Apply it through your Supabase dashboard or CLI
```

The assistant will work without throttling issues thanks to:
- Rate limiting (prevents API abuse)
- Caching (reduces API calls)
- Smart error handling (graceful degradation)
- Persistent storage (conversations saved in database)
- Multi-language support (automatic translation)
