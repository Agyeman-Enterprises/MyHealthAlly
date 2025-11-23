# MyHealthAlly Web App

A comprehensive healthcare management platform for patients and clinicians, built with Next.js, TypeScript, and Tailwind CSS.

## 🎨 Design System

- **Primary Color**: Teal `#39C6B3`
- **Border Radius**: 6px universal
- **Typography**: Inter, Roboto, Segoe
- **Framework**: Next.js 15 with App Router

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm --filter @myhealthally/web dev
```

Visit `http://localhost:3001` (or the port shown in terminal)

### Production Build

```bash
# Build for production
pnpm --filter @myhealthally/web build

# Start production server
pnpm --filter @myhealthally/web start
```

## 📁 Project Structure

```
packages/web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── patient/      # Patient-facing routes
│   │   ├── clinician/    # Clinician portal routes
│   │   └── content/      # Ohimaa content engine
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── widgets/     # Feature widgets
│   │   └── layout/      # Layout components
│   ├── theme/           # Design system tokens
│   ├── hooks/           # React hooks
│   ├── services/        # API services
│   └── utils/           # Utility functions
└── public/              # Static assets
```

## 🌐 Routes

### Patient App
- `/patient/dashboard` - Patient dashboard
- `/patient/analytics` - Health analytics & trends
- `/patient/labs` - Lab orders & results
- `/patient/messages` - Messaging with care team
- `/patient/schedule` - Appointment scheduling
- `/patient/profile` - Profile & settings

### Clinician Portal
- `/clinician/dashboard` - Clinician dashboard
- `/clinician/patients` - Patient list
- `/clinician/patients/[id]` - Patient detail
- `/clinician/visit/[id]` - Virtual visit workspace
- `/clinician/tasks` - Task center
- `/clinician/messages` - Messaging inbox
- `/clinician/labs` - Lab ordering center

### Ohimaa Content Engine
- `/content/programs` - Program library
- `/content/meal-plans` - Meal plan library
- `/content/exercises` - Exercise library
- `/content/stress` - Stress management resources
- `/content/sleep` - Sleep resources
- `/content/gi-reset` - GI reset program
- `/content/detox` - Detox program
- `/content/support` - Support resources

## 🔧 Environment Variables

Create `packages/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BUILDER_API_KEY_MYHEALTHALLY=your_api_key_here
NODE_ENV=development
```

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy!

## 🧪 Testing

```bash
# Run linter
pnpm --filter @myhealthally/web lint

# Type check
pnpm --filter @myhealthally/web type-check
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Design System](./docs/DESIGN_SYSTEM_IMPLEMENTATION.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: Radix UI + Custom components
- **Charts**: Recharts
- **State Management**: React Context + Hooks
- **API Client**: Fetch API with custom utilities

## 📄 License

Private - MyHealthAlly

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-XX
