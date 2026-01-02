# MyHealthAlly PWA - Environment Variables Template

**Copy these variables to your `.env.local` file**

```env
# ============================================================================
# API Configuration
# ============================================================================

# SoloPractice Backend API Base URL
# Production: https://api.your-production-domain.com
# Development: http://localhost:3000
# Staging: https://staging-api.myhealthally.co
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# ============================================================================
# Authentication
# ============================================================================

# JWT Secret (for token validation - if needed client-side)
# Note: Most JWT validation should be server-side
# JWT_SECRET=your-jwt-secret-here

# ============================================================================
# Database (if using local database for caching/offline)
# ============================================================================

# PostgreSQL connection string (if using Drizzle/Prisma for local caching)
# DATABASE_URL=postgresql://user:password@localhost:5432/myhealthally

# ============================================================================
# Translation Service (if implementing client-side translation)
# ============================================================================

# OpenAI API Key (for GPT-4 translation - if not using server-side)
# OPENAI_API_KEY=sk-...

# Whisper API Key (for audio transcription - if not using server-side)
# WHISPER_API_KEY=...

# ============================================================================
# Storage (if using cloud storage for documents/audio)
# ============================================================================

# AWS S3 (if storing audio files/documents)
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=myhealthally-uploads

# Supabase (MHA Backend) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Only for server-side operations

# ============================================================================
# Feature Flags
# ============================================================================

# Enable/disable features
# NEXT_PUBLIC_ENABLE_VOICE_MESSAGES=true
# NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
# NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false

# ============================================================================
# Analytics & Monitoring (Optional)
# ============================================================================

# Sentry (error tracking)
# SENTRY_DSN=https://...@sentry.io/...
# NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Maps API (for pharmacy autocomplete and geolocation)
# Get from: https://console.cloud.google.com/google/maps-apis
# Enable: Places API, Geocoding API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# ============================================================================
# Development
# ============================================================================

# Node environment
NODE_ENV=development

# Next.js telemetry (disable for privacy)
NEXT_TELEMETRY_DISABLED=1

# ============================================================================
# PWA Configuration
# ============================================================================

# PWA enabled (set to false to disable PWA features in dev)
# NEXT_PUBLIC_PWA_ENABLED=true

# ============================================================================
# Security
# ============================================================================

# Encryption key for local storage (generate a random 32-char string)
# ENCRYPTION_KEY=your-32-character-encryption-key-here
```

## Setup Instructions

1. **Create `.env.local` file in `pwa/` directory:**
   ```bash
   cd pwa
   cp ENV_TEMPLATE.md .env.local
   # Then edit .env.local and uncomment/fill in the values you need
   ```

2. **Required for basic functionality:**
   - `NEXT_PUBLIC_API_BASE_URL` - SoloPractice backend URL

3. **Optional (for advanced features):**
   - Database connection (if using local DB)
   - Storage credentials (if uploading files)
   - Translation API keys (if client-side translation)

4. **Important Notes:**
   - `.env.local` is in `.gitignore` and won't be committed
   - Use `NEXT_PUBLIC_*` prefix for client-side variables
   - Rebuild after changing: `npm run build`
   - For production, set these in your hosting platform (Vercel, Railway, etc.)

