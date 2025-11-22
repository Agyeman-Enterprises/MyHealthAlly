# Environment Variables Setup Guide

## Quick Start

1. **Backend**: Copy `packages/backend/.env.example` to `packages/backend/.env` and fill in values
2. **Web**: Copy `packages/web/.env.example` to `packages/web/.env.local` and fill in values
3. **iOS/Android**: Update API URLs in code (see respective .env.example files)

## Required Variables

### Backend (`packages/backend/.env`)

#### 🔴 REQUIRED (Must Set):
- `DATABASE_URL` - PostgreSQL connection string
  - **Option 1 (Recommended)**: Supabase connection string
    - Get from: https://supabase.com/dashboard → Settings → Database
    - Format: `postgresql://postgres.[REF]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true`
  - **Option 2**: Local Docker connection string
    - Format: `postgresql://myhealthally:myhealthally_dev@localhost:5432/myhealthally?schema=public`
- `JWT_SECRET` - Secret for JWT tokens (min 32 characters, use: `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 characters)

#### 🟡 OPTIONAL (Has Defaults):
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: development)
- `FRONTEND_URL` - CORS origin (default: http://localhost:3001)
- `JWT_EXPIRES_IN` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)

#### 🟢 OPTIONAL (Features):
- `DAILY_API_KEY` - Daily.co API key for telehealth (leave as `placeholder-secret` if not using)
- `SENTRY_DSN` - Sentry error tracking DSN (optional)

### Web Dashboard (`packages/web/.env.local`)

#### 🔴 REQUIRED:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)

#### 🟢 OPTIONAL:
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for frontend error tracking

### iOS App

Update in code: `packages/ios/MyHealthAlly/Networking/APIClient.swift`
```swift
private let baseURL = "http://localhost:3000"  // Change to your backend URL
```

For device testing, use your Mac's local IP:
```swift
private let baseURL = "http://192.168.1.100:3000"  // Your Mac's IP
```

### Android App

Update in code: `packages/android/app/src/main/java/com/myhealthally/app/data/network/ApiClient.kt`
```kotlin
private const val BASE_URL = "http://10.0.2.2:3000"  // Emulator
// or
private const val BASE_URL = "http://192.168.1.100:3000"  // Physical device
```

## Setup Steps

### 1. Backend Setup

```bash
cd packages/backend
cp .env.example .env
# Edit .env with your values
```

**Generate secure secrets:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Example `.env` for local development:**
```env
DATABASE_URL="postgresql://myhealthally:myhealthally_dev@localhost:5432/myhealthally?schema=public"
JWT_SECRET="<generated-secret-32-chars-min>"
JWT_REFRESH_SECRET="<generated-secret-32-chars-min>"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
DAILY_API_KEY=placeholder-secret
```

### 2. Web Dashboard Setup

```bash
cd packages/web
cp .env.example .env.local
# Edit .env.local with your backend URL
```

**Example `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. iOS Setup

Edit `packages/ios/MyHealthAlly/Networking/APIClient.swift`:
- Change `baseURL` to your backend URL
- For device testing, use your Mac's local IP address

### 4. Android Setup

Edit `packages/android/app/src/main/java/com/myhealthally/app/data/network/ApiClient.kt`:
- Change `BASE_URL` to your backend URL
- Use `10.0.2.2` for emulator (maps to localhost)
- Use your computer's IP for physical device

## Production Checklist

### Backend
- [ ] Use strong, unique secrets (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use production database URL
- [ ] Configure `FRONTEND_URL` to production domain
- [ ] Set up Daily.co API key if using telehealth
- [ ] Configure Sentry DSN for error tracking
- [ ] Use HTTPS for all connections

### Web
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Configure analytics if needed
- [ ] Set up Sentry for frontend errors

### Mobile Apps
- [ ] Update API URLs to production endpoints
- [ ] Use HTTPS only (remove HTTP support)
- [ ] Configure app signing certificates

## Security Notes

⚠️ **Never commit `.env` files to git!**

- All `.env` files are in `.gitignore`
- Only commit `.env.example` files
- Use different secrets for development and production
- Rotate secrets regularly in production
- Store production secrets securely (use secret management services)

## Troubleshooting

### Backend can't connect to database
- Check `DATABASE_URL` format
- Ensure PostgreSQL is running: `docker-compose ps`
- Verify credentials match docker-compose.yml

### CORS errors in web dashboard
- Check `FRONTEND_URL` in backend `.env` matches web URL
- Ensure backend CORS is configured correctly

### Mobile apps can't reach backend
- **iOS**: Use Mac's local IP, not `localhost`
- **Android Emulator**: Use `10.0.2.2` instead of `localhost`
- **Android Device**: Use computer's local IP address
- Check firewall settings

### JWT errors
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Secrets must be at least 32 characters
- Use the same secrets across all backend instances

