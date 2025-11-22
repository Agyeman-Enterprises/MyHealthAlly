# MyHealthAlly Architecture

## Overview

MyHealthAlly is a monorepo containing:
- **Backend**: NestJS API with Prisma ORM
- **Web**: Next.js clinic dashboard
- **iOS**: SwiftUI native app
- **Shared**: TypeScript types and interfaces

## Backend Architecture

### Tech Stack
- **Framework**: NestJS 10
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT with refresh tokens

### Modules
1. **Auth**: Authentication and authorization
2. **Users**: User management
3. **Clinics**: Clinic/organization management
4. **Patients**: Patient records
5. **Measurements**: Health data (BP, glucose, weight, etc.)
6. **Care Plans**: Patient care plans with phases and tasks
7. **Alerts**: Automated alert generation and management
8. **Visit Requests**: Patient visit scheduling

### Database Schema
- Users (with roles: PATIENT, PROVIDER, MEDICAL_ASSISTANT, ADMIN)
- Clinics
- Patients (linked to Users)
- Providers (linked to Users)
- Measurements (flexible JSON values)
- Care Plans (JSON structure for phases)
- Alerts (with severity and status)
- Visit Requests
- Refresh Tokens

### Alerts Engine
- Cron job runs every 5 minutes
- Checks for:
  - BP high trends (3 consecutive high readings)
  - Glucose high (multiple high readings)
  - No data (3+ days without measurements)

## Web Dashboard

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts

### Pages
- `/login`: Authentication
- `/dashboard`: Overview with stats and alerts
- `/patients`: Patient list with risk badges
- `/patients/[id]`: Patient detail with tabs (Overview, Metrics, Plan, Alerts)

### Features
- JWT authentication with httpOnly cookies (to be implemented)
- Risk scoring (Stable/Worsening/High risk)
- Metrics visualization
- Alert management

## iOS App

### Tech Stack
- **Framework**: SwiftUI
- **Architecture**: MVVM + Coordinator
- **Health Integration**: HealthKit
- **Networking**: URLSession with async/await

### Screens
1. **Onboarding**: Welcome screen
2. **Auth**: Sign in / Sign up
3. **Home**: Today's tasks, progress, plan phases
4. **Metrics**: Trends with charts (7/30/90 days)
5. **Coach**: Educational content feed
6. **Visits**: Visit request management
7. **Settings**: Account and preferences

### HealthKit Integration
- Reads: BP, glucose, weight, heart rate, steps, sleep
- Syncs last N days of data to backend
- Permission handling

## API Endpoints

### Auth
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`

### Patients
- `GET /patients`
- `GET /patients/:id`
- `GET /patients/:id/measurements`
- `POST /patients/:id/measurements`
- `GET /patients/:id/care-plans`
- `POST /patients/:id/care-plans`
- `GET /patients/:id/visit-requests`
- `POST /patients/:id/visit-requests`

### Alerts
- `GET /alerts`
- `GET /alerts/patients/:patientId`
- `PATCH /alerts/:id/resolve`
- `PATCH /alerts/:id/dismiss`

## Development Setup

1. Install dependencies: `pnpm install`
2. Start Docker: `docker-compose up -d`
3. Run migrations: `cd packages/backend && pnpm prisma migrate dev`
4. Start backend: `pnpm dev` (from root)
5. Start web: `cd packages/web && pnpm dev`
6. Open iOS project in Xcode

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port

### Web
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Future Enhancements
- Real-time messaging
- Push notifications
- Advanced analytics
- Provider scheduling system
- Patient education content management

