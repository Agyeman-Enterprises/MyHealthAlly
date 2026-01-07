# Redis Quick Start

## ✅ You Have Everything!

Your Upstash Redis credentials:
- **REST URL**: `https://amused-newt-31437.upstash.io`
- **REST Token**: `AXrNAAIncDI1NzdlYjA2Y2RmOTM0ZTE4YTU0OWM3OTk4MmQ1MmViY3AyMzE0Mzc`

## Next Steps

### Add to `.env.local`

Create or edit `pwa/.env.local`:

```env
# Upstash Redis (for AI chat rate limiting and caching)
UPSTASH_REDIS_REST_URL=https://amused-newt-31437.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXrNAAIncDI1NzdlYjA2Y2RmOTM0ZTE4YTU0OWM3OTk4MmQ1MmViY3AyMzE0Mzc
```

### 3. Restart Dev Server

```bash
npm run dev
```

### 4. Verify Connection

Check your console logs - you should see:
```
[Redis] Connected to Upstash Redis
```

## That's It!

The AI chat service will now use Redis for:
- ✅ Distributed rate limiting
- ✅ Persistent caching
- ✅ Multi-instance support

If Redis is unavailable, it automatically falls back to in-memory storage.

## Need Help?

See `REDIS_SETUP.md` for detailed documentation.
