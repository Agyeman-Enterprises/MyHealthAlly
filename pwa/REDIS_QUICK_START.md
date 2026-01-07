# Redis Quick Start

## ✅ Setup Required

You need to get your Upstash Redis credentials from the [Upstash Dashboard](https://console.upstash.com/).

1. Sign up or log in at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Go to "REST API" section
4. Copy your:
   - **REST URL** (e.g., `https://your-database.upstash.io`)
   - **REST Token** (a long alphanumeric string)

## Next Steps

### Add to `.env.local`

Create or edit `pwa/.env.local`:

```env
# Upstash Redis (for AI chat rate limiting and caching)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**⚠️ SECURITY WARNING**: Never commit `.env.local` to git! These credentials are sensitive.

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
