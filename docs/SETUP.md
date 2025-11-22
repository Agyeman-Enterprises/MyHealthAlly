# MyHealthAlly Setup Guide

## Prerequisites

- Node.js 22+
- pnpm 8+
- Docker & Docker Compose
- Xcode 15+ (for iOS development)
- PostgreSQL client (optional, for direct DB access)

## Initial Setup

### 1. Clone and Install

```bash
# Install dependencies
pnpm install
```

### 2. Start Docker Services

```bash
# Start Postgres and Redis
docker-compose up -d

# Verify services are running
docker ps
```

### 3. Backend Setup

```bash
cd packages/backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings (defaults should work for local dev)

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed database
# pnpm prisma db seed
```

### 4. Start Backend

```bash
# From root directory
pnpm dev

# Or from backend directory
cd packages/backend
pnpm dev
```

Backend will run on `http://localhost:3000`

### 5. Web Dashboard Setup

```bash
cd packages/web

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Start dev server
pnpm dev
```

Web dashboard will run on `http://localhost:3001`

### 6. iOS App Setup

1. Open `packages/ios/MyHealthAlly.xcodeproj` in Xcode
2. Select your development team in Signing & Capabilities
3. Enable HealthKit capability:
   - Select project → Target → Signing & Capabilities
   - Click "+ Capability"
   - Add "HealthKit"
4. Update API URL in `APIClient.swift` if needed
5. Build and run on simulator or device

## Creating Test Data

### Create a Clinic

```bash
curl -X POST http://localhost:3000/clinics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test Clinic"}'
```

### Register a Patient

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "role": "PATIENT",
    "clinicId": "CLINIC_ID",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Register Clinic Staff

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "password123",
    "role": "MEDICAL_ASSISTANT",
    "clinicId": "CLINIC_ID"
  }'
```

## Testing

### Backend Tests

```bash
cd packages/backend
pnpm test
pnpm test:e2e
```

### Web Tests

```bash
cd packages/web
pnpm test
```

## Troubleshooting

### Database Connection Issues

- Ensure Docker containers are running: `docker ps`
- Check Postgres logs: `docker logs myhealthally-postgres`
- Verify DATABASE_URL in `.env`

### Port Already in Use

- Backend (3000): Change `PORT` in `.env`
- Web (3001): Change port in `package.json` scripts
- Postgres (5432): Change in `docker-compose.yml`

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
cd packages/backend
pnpm prisma migrate reset

# Regenerate client
pnpm prisma generate
```

### iOS Build Issues

- Clean build folder: Cmd+Shift+K
- Delete DerivedData
- Restart Xcode
- Ensure HealthKit capability is enabled

## Production Deployment

### Backend

1. Set production environment variables
2. Run migrations: `pnpm prisma migrate deploy`
3. Build: `pnpm build`
4. Start: `pnpm start:prod`

### Web

1. Set `NEXT_PUBLIC_API_URL` to production backend
2. Build: `pnpm build`
3. Deploy to Vercel or similar

### iOS

1. Configure App Store Connect
2. Archive and upload via Xcode
3. Submit for review

