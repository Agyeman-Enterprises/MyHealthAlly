# MyHealthAlly – Continuous Care App

Monorepo for MyHealthAlly patient app and clinic dashboard.

## Structure

- `/packages/backend` - NestJS API with Prisma, Postgres, Redis
- `/packages/shared` - Shared TypeScript types and interfaces
- `/packages/web` - Next.js clinic dashboard (PWA)
- `/packages/ios` - SwiftUI iOS app with HealthKit
- `/docs` - Architecture and setup documentation

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 8+
- Docker & Docker Compose
- Xcode 15+ (for iOS development)

### Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Choose Database Option:**

   **Option A: Supabase (Recommended)**
   - Create project at https://supabase.com
   - Get connection string from Settings → Database
   - Update `DATABASE_URL` in `packages/backend/.env`
   - See `SUPABASE_SETUP.md` for detailed instructions

   **Option B: Local Docker**
   ```bash
   docker-compose up -d
   ```
   - Uses connection string already in `.env.example`

3. **Set up backend:**
```bash
cd packages/backend
# .env file should already exist from SETUP_ENV.ps1
# Update DATABASE_URL if using Supabase
pnpm prisma generate
pnpm prisma migrate dev
```

4. **Start backend:**
```bash
# From root
pnpm dev

# Or from backend directory
cd packages/backend && pnpm dev
```

5. **Start web dashboard:**
```bash
cd packages/web
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
pnpm dev
```

6. **iOS app:**
   - Open `packages/ios/MyHealthAlly.xcodeproj` in Xcode
   - Enable HealthKit capability
   - Build and run

## Development URLs

- Backend API: `http://localhost:3000`
- Web Dashboard: `http://localhost:3001`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Features

### Backend
- ✅ JWT authentication with refresh tokens
- ✅ User roles (Patient, Provider, MA, Admin)
- ✅ Patient management
- ✅ Health measurements (BP, glucose, weight, etc.)
- ✅ Care plans with phases and tasks
- ✅ Automated alerts engine (cron every 5 min)
- ✅ Visit request management

### Web Dashboard
- ✅ Clinic staff authentication
- ✅ Patient list with risk assessment
- ✅ Patient detail views (metrics, alerts, care plans)
- ✅ Alert management
- ✅ Visit scheduling

### iOS App
- ✅ Patient onboarding and authentication
- ✅ Home dashboard with today's tasks
- ✅ Metrics trends with charts
- ✅ HealthKit integration
- ✅ Visit request flow
- ✅ Coach feed (placeholder)

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design
- [Setup Guide](./docs/SETUP.md) - Detailed setup instructions

## Environment Variables

See `.env.example` files in each package for required environment variables.

## Testing

```bash
# Backend tests
cd packages/backend && pnpm test

# Web tests
cd packages/web && pnpm test
```

## License

Private - MyHealthAlly

