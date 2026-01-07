# AI Chat Service - Rate Limiting & Caching

## Commercial Best-Practice Implementation

This service implements industry-standard rate limiting and caching practices for AI chat services.

### Configuration

| Feature | Value | Notes |
|---------|-------|-------|
| **Cache TTL** | 3 minutes | Best practice: 2-5 minutes |
| **Cache Scope** | User + Conversation | Ensures user-specific caching |
| **Rate Limit** | 15 messages/minute/user | Best practice: 10-20 msgs/min/user |
| **Admin Bypass** | Yes | Admins are not rate limited |
| **Storage** | Redis (Upstash) | Automatic fallback to in-memory if Redis unavailable |
| **Error UX** | Friendly + Explicit | Clear messages with retry information |

### Rate Limiting

- **Window**: 1 minute (60 seconds)
- **Limit**: 15 requests per window per user
- **Admin Bypass**: Enabled (admins have unlimited requests)
- **Error Response**: 
  - HTTP 429 status
  - Friendly error message
  - `Retry-After` header with seconds to wait
  - Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Window`)

### Caching

- **TTL**: 3 minutes (180 seconds)
- **Scope**: User ID + Message + Recent Conversation History
- **Max Size**: 100 entries
- **Eviction**: LRU (Least Recently Used) when cache is full

### Redis Integration (Production)

**✅ IMPLEMENTED**: The service now uses Upstash Redis for production-grade caching and rate limiting.

**Setup:**
1. Get Upstash Redis credentials (REST URL and Token)
2. Add to `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token-here
   ```
3. System automatically uses Redis if available, falls back to in-memory if not

**Benefits:**
- ✅ Distributed caching across multiple server instances
- ✅ Persistent rate limiting (survives server restarts)
- ✅ Automatic fallback to in-memory storage
- ✅ Zero code changes needed

See `REDIS_SETUP.md` for detailed setup instructions.

### Monitoring

- Track cache hit rates via Redis dashboard
- Monitor rate limit violations
- Check Redis connection status in logs

### Error Handling

All errors are user-friendly and explicit:

- **Rate Limit**: Clear message with wait time
- **Service Unavailable**: Temporary issue message with retry suggestion
- **Generic Errors**: Friendly message without technical details

### Admin Bypass

Admins (users with `role === 'admin'`) bypass all rate limiting. This is useful for:
- Testing and debugging
- Support scenarios
- Internal use cases

### API Usage

```typescript
import { chatWithAssistant } from '@/lib/services/ai-chat-service';

const response = await chatWithAssistant({
  message: "What are the symptoms of flu?",
  conversationHistory: [...],
  userId: "user-123", // For user-scoped caching
  isAdmin: false, // For admin bypass
}, "user-123"); // User identifier for rate limiting
```
