# Development Token Limits

## Overview

To conserve API tokens during development, the app automatically applies stricter limits when running in development mode (`NODE_ENV=development`).

## Automatic Dev Limits

### AI Chat Service (`ai-chat-service.ts`)

| Setting | Development | Production |
|---------|-------------|-----------|
| **Max Tokens** | 500 | 1000 |
| **Rate Limit** | 5 messages/minute | 15 messages/minute |
| **Cache TTL** | 10 minutes | 3 minutes |

**Impact:**
- 50% fewer tokens per response
- 67% fewer requests allowed
- 3x longer cache (fewer API calls)

### Symptom Analysis Service (`anthropic-service.ts`)

| Function | Development | Production |
|----------|-------------|-----------|
| **Patient Summary** | 250 tokens | 500 tokens |
| **Clinician Summary** | 400 tokens | 800 tokens |
| **Education Content** | 200 tokens | 400 tokens |
| **Follow-ups** | 150 tokens | 300 tokens |

**Impact:**
- 50% fewer tokens across all functions
- Significantly reduced API costs during development

## How It Works

The limits are automatically applied based on `NODE_ENV`:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const MAX_TOKENS = isDevelopment ? 500 : 1000;
```

**No configuration needed** - it just works when you run `npm run dev`.

## Additional Token Conservation Tips

### 1. Use Caching

The cache is **3x longer in dev** (10 minutes vs 3 minutes). This means:
- Same question = cached response (no API call)
- Test different questions to see variety
- Wait 10 minutes to test fresh responses

### 2. Rate Limiting

You're limited to **5 messages per minute** in dev. This prevents:
- Accidental spam clicking
- Excessive token usage
- API rate limit errors

### 3. Disable AI Service (Optional)

If you want to test without any API calls:

```env
# In .env.local - just don't set this:
# ANTHROPIC_API_KEY=...
```

The app will show "AI service unavailable" but won't make any API calls.

### 4. Use Mock Responses (Advanced)

For extensive testing without API calls, you could add a mock mode:

```typescript
// In ai-chat-service.ts
if (process.env.MOCK_AI_RESPONSES === 'true') {
  return { response: 'Mock response for testing...' };
}
```

## Monitoring Token Usage

### Check Anthropic Dashboard

1. Visit https://console.anthropic.com/
2. Go to "Usage" section
3. Monitor your token consumption

### Estimate Costs

- **Input tokens**: ~$3 per 1M tokens
- **Output tokens**: ~$15 per 1M tokens
- **Dev limits**: ~50% reduction = ~50% cost savings

### Example Calculation

**Production:**
- 1000 tokens/response × 15 requests/min = 15,000 tokens/min
- In 1 hour: 900,000 tokens
- Cost: ~$0.27/hour (at max usage)

**Development:**
- 500 tokens/response × 5 requests/min = 2,500 tokens/min
- In 1 hour: 150,000 tokens
- Cost: ~$0.045/hour (at max usage)

**Savings: 83% reduction in dev mode!**

## Override Dev Limits (Not Recommended)

If you need production limits in dev (for testing), you can temporarily modify:

```typescript
// In ai-chat-service.ts
const MAX_TOKENS = 1000; // Override dev limit
const MAX_REQUESTS_PER_WINDOW = 15; // Override dev limit
```

**Warning:** This will use more tokens. Only do this if you need to test production behavior.

## Best Practices

1. ✅ **Use dev mode** (`npm run dev`) - automatic limits applied
2. ✅ **Leverage caching** - wait 10 minutes between same questions
3. ✅ **Test incrementally** - don't spam the API
4. ✅ **Monitor usage** - check Anthropic dashboard regularly
5. ✅ **Use production limits** only when testing production behavior

## Summary

- **Automatic**: Dev limits apply when `NODE_ENV=development`
- **50% token reduction**: All max_tokens cut in half
- **67% rate reduction**: 5 req/min vs 15 req/min
- **3x longer cache**: 10 min vs 3 min
- **No config needed**: Just run `npm run dev`

Your tokens are automatically conserved during development! 🎉
