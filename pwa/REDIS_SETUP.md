# Redis Integration for AI Chat Rate Limiting & Caching

## Overview

The AI chat service now uses **Upstash Redis** for production-grade rate limiting and caching. This provides:
- **Distributed caching** across multiple server instances
- **Persistent rate limiting** that survives server restarts
- **Automatic fallback** to in-memory storage if Redis is unavailable

## Setup

### 1. Get Upstash Redis Credentials

1. Sign up at [Upstash](https://upstash.com) (free tier available)
2. Create a new Redis database
3. Go to "REST API" section
4. Copy:
   - **REST URL** (e.g., `https://your-database.upstash.io`)
   - **REST Token** (a long alphanumeric string)

**⚠️ SECURITY**: Keep these credentials secure and never commit them to version control!

### 2. Add Environment Variables

Add to your `.env.local` file (create it if it doesn't exist):

```env
# Upstash Redis (for AI chat rate limiting and caching)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**⚠️ IMPORTANT**: 
- `.env.local` is already in `.gitignore` - never commit this file!
- Use different credentials for development and production

### 3. Install Dependencies

```bash
npm install @upstash/redis
```

## How It Works

### Automatic Fallback

- **With Redis**: Uses distributed Redis for caching and rate limiting
- **Without Redis**: Automatically falls back to in-memory storage
- **No code changes needed** - the system detects Redis availability

### Rate Limiting

- **Key**: `ratelimit:ai-chat:{userId}`
- **Window**: 60 seconds
- **Limit**: 15 requests per window
- **Admin Bypass**: Admins are not rate limited

### Caching

- **Key**: `cache:ai-chat:{userId}|{message}|{history}`
- **TTL**: 3 minutes (180 seconds)
- **Scope**: User + conversation context

## Configuration

### Current Settings (Commercial Best Practices)

```typescript
CACHE_TTL_SECONDS = 180        // 3 minutes (2-5 min range)
RATE_LIMIT_WINDOW_SECONDS = 60 // 1 minute
MAX_REQUESTS_PER_WINDOW = 15   // 15 requests/min (10-20 range)
```

### Customization

Edit `pwa/lib/services/ai-chat-service.ts`:

```typescript
const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests/min
```

## Monitoring

### Check Redis Status

```typescript
import { getCacheStats } from '@/lib/services/ai-chat-service';

const stats = getCacheStats();
console.log(stats);
// { redisAvailable: true, storage: 'Redis' }
```

### Check Connection

The system logs Redis connection status:
- `[Redis] Connected to Upstash Redis` - Success
- `[Redis] Redis credentials not configured, using in-memory fallback` - No credentials
- `[Redis] Failed to initialize Redis client, using in-memory fallback` - Connection error

## Production Deployment

### Vercel

1. Add environment variables in Vercel dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. Redeploy

### Other Platforms

Add environment variables to your hosting platform's configuration.

## Benefits

✅ **Distributed**: Works across multiple server instances  
✅ **Persistent**: Rate limits survive server restarts  
✅ **Scalable**: Handles high traffic efficiently  
✅ **Resilient**: Automatic fallback if Redis is unavailable  
✅ **Cost-effective**: Upstash free tier is generous  

## Troubleshooting

### Redis Not Connecting

1. Check environment variables are set correctly
2. Verify Upstash database is active
3. Check REST API credentials (not regular Redis connection string)
4. System will automatically fall back to in-memory storage

### Rate Limits Not Working

1. Verify Redis is connected: Check logs for `[Redis] Connected`
2. Check rate limit keys in Upstash dashboard
3. Verify `userId` is being passed correctly

### Cache Not Working

1. Check cache keys in Upstash dashboard
2. Verify TTL is set correctly
3. Check Redis connection status

## Cost

**Upstash Free Tier:**
- 10,000 commands/day
- 256 MB storage
- Perfect for development and small production deployments

**Paid Plans:**
- Start at $0.20 per 100K commands
- Scales automatically

## Security

- **REST API Token**: Keep secure, never commit to git
- **RLS**: Rate limiting keys are user-scoped
- **TTL**: Cache entries expire automatically
- **No PII**: Cache keys don't contain sensitive data
