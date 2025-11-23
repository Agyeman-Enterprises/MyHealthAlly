# Environment Variables

This document lists all environment variables used by the MyHealthAlly application.

---

## Backend (NestJS)

Location: `packages/backend/.env`

### Required Variables

#### Database
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```
- **Description**: PostgreSQL connection string
- **Example**: `postgresql://postgres:password@localhost:5432/myhealthally`
- **Required**: Yes

#### JWT Authentication
```bash
JWT_SECRET=your-super-secret-jwt-key-here
```
- **Description**: Secret key for signing JWT tokens
- **Example**: `my-super-secret-jwt-key-change-in-production`
- **Required**: Yes
- **Security**: Must be a strong, random string in production

```bash
JWT_EXPIRES_IN=15m
```
- **Description**: JWT access token expiration time
- **Example**: `15m` (15 minutes), `1h` (1 hour), `7d` (7 days)
- **Default**: `15m`
- **Required**: No

### Optional Variables

#### Server Configuration
```bash
PORT=3000
```
- **Description**: Port for backend server to listen on
- **Example**: `3000`, `4000`, `8080`
- **Default**: `3000`
- **Required**: No (uses default or port from startup script)

```bash
NODE_ENV=development
```
- **Description**: Node.js environment
- **Example**: `development`, `production`, `test`
- **Default**: `development`
- **Required**: No

#### CORS Configuration
```bash
FRONTEND_URL=http://localhost:3001
```
- **Description**: Frontend URL for CORS configuration
- **Example**: `http://localhost:3001`, `https://app.myhealthally.com`
- **Default**: `http://localhost:3001`
- **Required**: No

#### Daily.co (Telehealth)
```bash
DAILY_API_KEY=your-daily-api-key
```
- **Description**: Daily.co API key for virtual visit rooms
- **Example**: `abc123def456...`
- **Required**: No (only if using virtual visits)

```bash
DAILY_API_URL=https://api.daily.co/v1
```
- **Description**: Daily.co API base URL
- **Default**: `https://api.daily.co/v1`
- **Required**: No

---

## Frontend (Next.js)

Location: `packages/web/.env.local` or `packages/web/.env`

### Required Variables

#### Builder.io
```bash
NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY=your-builder-api-key
```
- **Description**: Builder.io public API key for CMS
- **Example**: `27c0a1050b53444993b6c4968fdc6bd1`
- **Required**: Yes (for patient-facing pages)

### Optional Variables

#### API Configuration
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```
- **Description**: Backend API base URL
- **Example**: `http://localhost:3000`, `https://api.myhealthally.com`
- **Default**: `http://localhost:3000`
- **Required**: No

#### Next.js Configuration
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
```
- **Description**: Frontend application URL
- **Example**: `http://localhost:3001`, `https://app.myhealthally.com`
- **Default**: `http://localhost:3001`
- **Required**: No

---

## Mobile (iOS/Android)

Location: `packages/mobile/.env.development` and `packages/mobile/.env.production`

### Development Environment

```bash
# packages/mobile/.env.development
API_BASE_URL=http://localhost:3000
```

- **Description**: Backend API base URL for development
- **Example**: `http://localhost:3000`, `http://192.168.1.100:3000` (for device testing)
- **Required**: Yes

**Note**: For iOS Simulator, use `http://localhost:3000`. For physical devices, use your computer's local IP address (e.g., `http://192.168.1.100:3000`).

### Production Environment

```bash
# packages/mobile/.env.production
API_BASE_URL=https://api.yourdomain.com
```

- **Description**: Backend API base URL for production
- **Example**: `https://api.myhealthally.com`
- **Required**: Yes

### JWT Configuration

**Note**: JWT secret is NOT needed on mobile/client side. The backend handles JWT signing and validation. Mobile apps only need to:
1. Store the `accessToken` and `refreshToken` received from `/auth/login`
2. Include `accessToken` in `Authorization: Bearer <token>` header for API requests
3. Use `refreshToken` to get new `accessToken` when it expires

---

## Environment File Examples

### Backend `.env` (Development)
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/myhealthally_dev

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=15m

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001

# Daily.co (optional)
DAILY_API_KEY=your-daily-api-key
DAILY_API_URL=https://api.daily.co/v1
```

### Backend `.env` (Production)
```bash
# Database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/myhealthally_prod

# JWT (use strong random secret)
JWT_SECRET=<generate-strong-random-secret>
JWT_EXPIRES_IN=15m

# Server
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL=https://app.myhealthally.com

# Daily.co
DAILY_API_KEY=<production-daily-api-key>
DAILY_API_URL=https://api.daily.co/v1
```

### Frontend `.env.local` (Development)
```bash
NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY=27c0a1050b53444993b6c4968fdc6bd1
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Frontend `.env.local` (Production)
```bash
NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY=<production-builder-api-key>
NEXT_PUBLIC_API_URL=https://api.myhealthally.com
NEXT_PUBLIC_APP_URL=https://app.myhealthally.com
```

### Mobile `.env.development`
```bash
API_BASE_URL=http://localhost:3000
```

### Mobile `.env.production`
```bash
API_BASE_URL=https://api.myhealthally.com
```

---

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong secrets** in production (generate with `openssl rand -base64 32`)
3. **Rotate secrets** periodically
4. **Use different secrets** for development, staging, and production
5. **JWT_SECRET** must be kept secret on backend only
6. **Mobile apps** should never have access to JWT_SECRET
7. **API keys** (Builder.io, Daily.co) should be kept secure

---

## Port Strategy

### Development
- **Backend**: Port 3000 (default) or dynamically assigned by `start-servers.js`
- **Frontend**: Port 3001 (default) or dynamically assigned by `start-servers.js`
- **Mobile**: Uses `API_BASE_URL` from `.env.development` (no port discovery needed)

### Production
- **Backend**: Configured via `PORT` env var or deployment platform
- **Frontend**: Configured via deployment platform (Vercel, Netlify, etc.)
- **Mobile**: Uses `API_BASE_URL` from `.env.production`

**Note**: Mobile apps do NOT need port-finding logic. They simply use the `API_BASE_URL` from their environment file.

---

## Loading Order

1. **Backend**: Loads `.env` from `packages/backend/` directory
2. **Frontend**: Next.js loads `.env.local` (highest priority), then `.env`
3. **Mobile**: Loads `.env.development` or `.env.production` based on build configuration

---

## Validation

The backend uses NestJS `ConfigModule` to validate environment variables. Missing required variables will cause the application to fail on startup with a clear error message.

