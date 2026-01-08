# AI Service Diagnostic Guide

## Understanding the "AI service is currently unavailable" Message

### Is this a glitch?

**No, this is a graceful fallback**, not a glitch. The system is designed to check for API configuration before attempting to use AI services.

### What causes this message?

The message appears when the `ANTHROPIC_API_KEY` environment variable is:
- Not set in your `.env.local` file
- Set but empty
- Invalid or expired

### How the system works

Looking at `pwa/lib/services/ai-chat-service.ts` (lines 207-209):

```typescript
if (!anthropic) {
  throw new Error('AI service is currently unavailable. Please try again later.');
}
```

The `anthropic` client is initialized only if `ANTHROPIC_API_KEY` is present:

```typescript
const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  : null;
```

This is a **defensive programming practice** that prevents:
- API errors from missing keys
- Unclear error messages
- Unnecessary API calls

### How to fix it

1. **Get an Anthropic API key:**
   - Visit https://console.anthropic.com/
   - Sign up or log in
   - Create an API key

2. **Add to your environment:**
   - Open `pwa/.env.local` (create it if it doesn't exist)
   - Add: `ANTHROPIC_API_KEY=your_key_here`
   - Save the file

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Diagnostic script

Run this to check your configuration:

```bash
node pwa/scripts/check-ai-config.mjs
```

### Is the AI service required?

**No, the AI service is optional.** The application will function without it, but these features will be unavailable:
- AI Chat Assistant
- AI-powered symptom analysis
- AI-generated health insights

All other features (education resources, vitals tracking, messaging, etc.) work independently.

### Testing without API key

If you want to test the app without setting up the AI service:
- The app will work normally
- AI chat will show "unavailable" message
- Other features remain functional

### Common issues

**Issue:** Key is set but still shows unavailable
- **Solution:** Restart your dev server after adding the key

**Issue:** Key works in one environment but not another
- **Solution:** Check that `.env.local` exists in the `pwa/` directory, not the root

**Issue:** Getting rate limit errors
- **Solution:** This is different - your key is working but you've hit usage limits. Wait a few minutes or upgrade your Anthropic plan.
