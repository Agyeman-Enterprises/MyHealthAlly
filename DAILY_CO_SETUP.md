# Daily.co Video API Setup Guide

## Which Daily.co Product?

For MyHealthAlly telehealth, you need: **Daily.co Video API** (NOT Pipecat)

- ✅ **Daily.co Video** = WebRTC video calls (what we need)
- ❌ **Pipecat** = AI voice agents (not needed)

## Setup Steps

### 1. Sign Up for Daily.co Video

1. Go to: https://dashboard.daily.co/
2. Sign up / Log in
3. You'll be in the **Video** dashboard (not Pipecat)

### 2. Get Your API Key

1. In Daily.co dashboard, go to **Developers** → **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "MyHealthAlly Production")
4. Copy the API key (starts with something like `abc123def456...`)
5. **Important**: Save this key securely - you can only see it once!

### 3. Update Backend .env

Edit `packages/backend/.env` and add:

```env
DAILY_API_KEY="your-actual-api-key-here"
```

Replace `placeholder-secret` with your real API key.

### 4. Domain Setup (Optional but Recommended)

1. In Daily.co dashboard, go to **Settings** → **Domains**
2. You can use the default domain (e.g., `yourproject.daily.co`)
3. Or add a custom domain for production

### 5. Test the Integration

After updating the API key, the backend will automatically use Daily.co's real API instead of placeholders.

## API Key Format

Your Daily.co API key will look like:
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

It's a long alphanumeric string (usually 40+ characters).

## What Happens After Setup

Once you add the API key:
- ✅ Video rooms will be created via Daily.co API
- ✅ Tokens will be generated using Daily.co's token system
- ✅ Video calls will work in web and iOS apps
- ✅ Rooms will auto-expire after use

## Free Tier Limits

Daily.co Video free tier includes:
- 10,000 participant-minutes/month
- Unlimited rooms
- Up to 100 concurrent participants
- Perfect for development and small deployments

## Security Notes

- ⚠️ Never commit your API key to git
- ⚠️ Use different keys for development and production
- ⚠️ Rotate keys regularly
- ⚠️ Restrict API key permissions if possible

## Troubleshooting

**"Invalid API key" error:**
- Check you copied the full key
- Verify you're using Video API key (not Pipecat)
- Make sure there are no extra spaces

**Rooms not creating:**
- Verify API key is correct
- Check Daily.co dashboard for API usage/errors
- Ensure your account is active

## Next Steps

After adding your API key:
1. Restart your backend server
2. Test creating a video room via API
3. Test joining a call from web/iOS

