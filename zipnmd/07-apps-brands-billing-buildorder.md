## 7. Patient App Architecture

### 7.1 Route Structure

```
/app
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── verify/page.tsx
├── patient/
│   ├── layout.tsx                    # Patient shell with bottom nav
│   ├── dashboard/page.tsx            # Home/daily snapshot
│   ├── analytics/page.tsx            # HRV/vitals trends
│   ├── messages/
│   │   ├── page.tsx                  # Thread list
│   │   └── [threadId]/page.tsx       # Thread detail
│   ├── schedule/
│   │   ├── page.tsx                  # Appointments list
│   │   ├── book/page.tsx             # Book appointment
│   │   └── walk-in/page.tsx          # Walk-in request
│   ├── profile/
│   │   ├── page.tsx                  # Profile overview
│   │   ├── settings/page.tsx         # Account settings
│   │   ├── devices/page.tsx          # Connected devices
│   │   ├── insurance/page.tsx        # Insurance info
│   │   ├── billing/page.tsx          # Billing/payments
│   │   └── language/page.tsx         # Language settings
│   ├── care-plan/page.tsx            # Care plan viewer
│   ├── labs/page.tsx                 # Lab results
│   ├── medications/page.tsx          # Medications list
│   ├── documents/page.tsx            # Documents
│   ├── journal/page.tsx              # Health journal
│   ├── emergency/page.tsx            # Emergency info
│   ├── resources/page.tsx            # Education content
│   ├── onboarding/page.tsx           # Guided intro
│   ├── intake/page.tsx               # Clinical intake
│   └── notifications/page.tsx        # Notification center
```

### 7.2 Patient Dashboard

```typescript
// app/patient/dashboard/page.tsx
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { getServerSession } from '@/lib/auth';
import { VitalsSummary } from '@/components/vitals/vitals-summary';
import { TodayTasks } from '@/components/care-plan/today-tasks';
import { NextAppointment } from '@/components/scheduling/next-appointment';
import { MessagesPreview } from '@/components/messaging/messages-preview';
import { DailyInsight } from '@/components/analytics/daily-insight';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PatientDashboard() {
  const session = await getServerSession();
  const t = useTranslations('patient.dashboard');

  const greeting = getGreeting();

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {t('greeting', { timeOfDay: greeting, name: session.user.firstName })}
        </h1>
        <p className="text-muted-foreground">{t('todaySnapshot')}</p>
      </div>

      {/* Vitals Summary */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t('vitals')}</h2>
        <Suspense fallback={<VitalsSkeleton />}>
          <VitalsSummary patientId={session.patientId} />
        </Suspense>
      </section>

      {/* Today's Tasks */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t('tasks')}</h2>
        <Suspense fallback={<TasksSkeleton />}>
          <TodayTasks patientId={session.patientId} />
        </Suspense>
      </section>

      {/* Next Appointment */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t('nextAppointment')}</h2>
        <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
          <NextAppointment patientId={session.patientId} />
        </Suspense>
      </section>

      {/* Messages Preview */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t('messages')}</h2>
        <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
          <MessagesPreview patientId={session.patientId} />
        </Suspense>
      </section>

      {/* Daily Insight */}
      <Suspense fallback={<Skeleton className="h-20 rounded-xl" />}>
        <DailyInsight patientId={session.patientId} />
      </Suspense>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
```

### 7.3 Patient Layout

```typescript
// app/patient/layout.tsx
import { BottomNav } from '@/components/navigation/bottom-nav';
import { getUnreadMessageCount } from '@/lib/api/messages';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadCount = await getUnreadMessageCount();

  return (
    <div className="min-h-screen bg-surfaceSecondary">
      <main className="pb-16">{children}</main>
      <BottomNav unreadMessages={unreadCount} />
    </div>
  );
}
```

---

## 8. Clinician App Architecture

### 8.1 Route Structure

```
/app/clinician/
├── layout.tsx                        # Clinician shell with sidebar
├── dashboard/page.tsx                # Today overview
├── patients/
│   ├── page.tsx                      # Patient list
│   └── [patientId]/
│       ├── page.tsx                  # Patient chart overview
│       ├── vitals/page.tsx           # Vitals detail
│       ├── care-plan/page.tsx        # Care plan management
│       ├── encounters/page.tsx       # Encounter history
│       ├── labs/page.tsx             # Lab results
│       ├── medications/page.tsx      # Medications
│       └── documents/page.tsx        # Documents
├── visit/
│   └── [visitId]/page.tsx            # Virtual visit / documentation
├── tasks/page.tsx                    # Task center
├── messages/page.tsx                 # Messaging center
├── labs/page.tsx                     # Lab review queue
├── alerts/page.tsx                   # Alert management
├── billing/page.tsx                  # RPM/CCM billing
└── settings/page.tsx                 # Clinician settings
```

### 8.2 Clinician Layout

```typescript
// app/clinician/layout.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageCircle,
  TestTube,
  AlertTriangle,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/clinician/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clinician/patients', icon: Users, label: 'Patients' },
  { href: '/clinician/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/clinician/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/clinician/labs', icon: TestTube, label: 'Labs' },
  { href: '/clinician/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/clinician/billing', icon: DollarSign, label: 'Billing' },
  { href: '/clinician/settings', icon: Settings, label: 'Settings' },
];

export default function ClinicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-surfaceSecondary">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-surface transition-all',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <span className="text-lg font-bold text-primary">MyHealthAlly</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-muted"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

### 8.3 Clinician Dashboard

```typescript
// app/clinician/dashboard/page.tsx
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TodaySchedule } from '@/components/scheduling/today-schedule';
import { HighRiskPatients } from '@/components/patient/high-risk-patients';
import { PendingTasks } from '@/components/tasks/pending-tasks';
import { UnreadMessages } from '@/components/messaging/unread-messages';
import { ActiveAlerts } from '@/components/alerts/active-alerts';
import { BillingSummary } from '@/components/billing/billing-summary';

export default function ClinicianDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <TodaySchedule />
            </Suspense>
          </CardContent>
        </Card>

        {/* High Risk Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-danger">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <HighRiskPatients />
            </Suspense>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <ActiveAlerts limit={5} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <PendingTasks limit={5} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Unread Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <UnreadMessages limit={5} />
            </Suspense>
          </CardContent>
        </Card>

        {/* RPM/CCM Billing Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>This Month's Billing (RPM/CCM)</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <BillingSummary />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 9. Multi-Brand Configuration

### 9.1 Brand Configuration

```typescript
// config/brands.ts
export const BRANDS = {
  linala: {
    id: 'linala',
    name: "Lina'la",
    tagline: 'Your Life, Your Health',
    practice: 'Ohimaa GU Functional Medicine',
    region: 'guam',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ch', 'chu', 'mh'],
    theme: {
      primary: '#2BA39B',
      logo: '/brands/linala/logo.svg',
      favicon: '/brands/linala/favicon.ico',
    },
    features: {
      cofaSupport: true,
      glp1Tracking: true,
      voiceMessages: true,
    },
    contact: {
      phone: '+1-671-XXX-XXXX',
      email: 'care@ohimaagu.com',
      address: 'Tamuning, Guam',
    },
  },
  myhealthally: {
    id: 'myhealthally',
    name: 'MyHealthAlly',
    tagline: 'Your Health Partner',
    practice: 'Bookadoc2u',
    region: 'international',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fil'],
    theme: {
      primary: '#2BA39B',
      logo: '/brands/myhealthally/logo.svg',
      favicon: '/brands/myhealthally/favicon.ico',
    },
    features: {
      cofaSupport: false,
      glp1Tracking: true,
      voiceMessages: true,
    },
    contact: {
      phone: '+1-XXX-XXX-XXXX',
      email: 'support@myhealthally.com',
      address: '',
    },
  },
} as const;

export type BrandId = keyof typeof BRANDS;
export type Brand = typeof BRANDS[BrandId];
```

### 9.2 Brand Context

```typescript
// context/brand-context.tsx
'use client';

import { createContext, useContext } from 'react';
import { Brand, BRANDS, BrandId } from '@/config/brands';

const BrandContext = createContext<Brand>(BRANDS.myhealthally);

export function BrandProvider({
  brandId,
  children,
}: {
  brandId: BrandId;
  children: React.ReactNode;
}) {
  const brand = BRANDS[brandId];

  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
```

### 9.3 Brand Detection Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  let brandId = 'myhealthally';
  
  if (hostname.includes('linala') || hostname.includes('ohimaagu')) {
    brandId = 'linala';
  }

  const response = NextResponse.next();
  response.headers.set('x-brand-id', brandId);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 10. RPM/CCM Billing Integration

### 10.1 RPM Requirements

```typescript
// services/rpm-tracker.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '@/database';
import { vitals, billingPeriodSummaries, billableTimeEntries } from '@/database/schema';
import { eq, and, between, sql } from 'drizzle-orm';

@Injectable()
export class RpmTrackerService {
  /**
   * RPM Billing Requirements:
   * - 99453: Initial setup (one-time)
   * - 99454: Device supply, 16+ days of readings per month
   * - 99457: First 20 minutes of RPM time
   * - 99458: Additional 20 minutes (can bill multiple)
   */

  async trackReading(patientId: string, vitalId: string) {
    const vital = await db.query.vitals.findFirst({
      where: eq(vitals.id, vitalId),
    });

    if (!vital) return;

    // Mark as RPM transmitted
    await db
      .update(vitals)
      .set({
        rpmTransmitted: true,
        rpmTransmittedAt: new Date(),
      })
      .where(eq(vitals.id, vitalId));

    // Update billing period summary
    await this.updatePeriodSummary(patientId);
  }

  async updatePeriodSummary(patientId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Count unique days with readings
    const daysWithReadings = await db
      .select({
        uniqueDays: sql<number>`COUNT(DISTINCT DATE(${vitals.measuredAt}))`,
        totalReadings: sql<number>`COUNT(*)`,
      })
      .from(vitals)
      .where(
        and(
          eq(vitals.patientId, patientId),
          eq(vitals.rpmTransmitted, true),
          between(vitals.measuredAt, periodStart, periodEnd)
        )
      );

    const days = daysWithReadings[0]?.uniqueDays || 0;
    const readings = daysWithReadings[0]?.totalReadings || 0;

    // Get total RPM time for the period
    const timeEntries = await db
      .select({
        totalSeconds: sql<number>`SUM(${billableTimeEntries.durationSeconds})`,
      })
      .from(billableTimeEntries)
      .where(
        and(
          eq(billableTimeEntries.patientId, patientId),
          sql`${billableTimeEntries.codeType} LIKE 'rpm_%'`,
          between(billableTimeEntries.billingPeriodStart, periodStart, periodEnd)
        )
      );

    const rpmTimeSeconds = timeEntries[0]?.totalSeconds || 0;

    // Determine eligibility
    const rpmEligible = days >= 16; // 16+ days required for 99454

    // Calculate codes earned
    const codesEarned = [];

    if (rpmEligible) {
      codesEarned.push({ code: 'rpm_99454', units: 1 });

      // 99457: First 20 minutes
      if (rpmTimeSeconds >= 20 * 60) {
        codesEarned.push({ code: 'rpm_99457', units: 1 });
      }

      // 99458: Additional 20-minute increments
      const additionalMinutes = Math.max(0, rpmTimeSeconds - 20 * 60);
      const additional20MinBlocks = Math.floor(additionalMinutes / (20 * 60));
      if (additional20MinBlocks > 0) {
        codesEarned.push({ code: 'rpm_99458', units: additional20MinBlocks });
      }
    }

    // Upsert summary
    await db
      .insert(billingPeriodSummaries)
      .values({
        patientId,
        periodStart,
        periodEnd,
        rpmDaysWithReadings: days,
        rpmTotalReadings: readings,
        rpmTimeSeconds,
        rpmEligible,
        codesEarned,
      })
      .onConflictDoUpdate({
        target: [billingPeriodSummaries.patientId, billingPeriodSummaries.periodStart],
        set: {
          rpmDaysWithReadings: days,
          rpmTotalReadings: readings,
          rpmTimeSeconds,
          rpmEligible,
          codesEarned,
          updatedAt: new Date(),
        },
      });
  }
}
```

### 10.2 CCM Time Tracker

```typescript
// services/ccm-tracker.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '@/database';
import { billableTimeEntries, billingPeriodSummaries } from '@/database/schema';
import { eq, and, between, sql } from 'drizzle-orm';

@Injectable()
export class CcmTrackerService {
  /**
   * CCM Billing Requirements:
   * - Patient must have 2+ chronic conditions
   * - 99490: First 20 minutes of CCM per month
   * - 99439: Additional 20 minutes (can bill multiple)
   * - 99491: Complex CCM first 30 minutes
   */

  async logTime(
    patientId: string,
    userId: string,
    activityType: string,
    durationSeconds: number,
    description?: string,
  ) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await db.insert(billableTimeEntries).values({
      patientId,
      userId,
      codeType: 'ccm_99490',
      startedAt: new Date(now.getTime() - durationSeconds * 1000),
      endedAt: now,
      durationSeconds,
      activityType,
      description,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
    });

    await this.updatePeriodSummary(patientId);
  }

  async updatePeriodSummary(patientId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total CCM time
    const timeEntries = await db
      .select({
        totalSeconds: sql<number>`SUM(${billableTimeEntries.durationSeconds})`,
      })
      .from(billableTimeEntries)
      .where(
        and(
          eq(billableTimeEntries.patientId, patientId),
          sql`${billableTimeEntries.codeType} LIKE 'ccm_%'`,
          between(billableTimeEntries.billingPeriodStart, periodStart, periodEnd)
        )
      );

    const ccmTimeSeconds = timeEntries[0]?.totalSeconds || 0;
    const ccmEligible = ccmTimeSeconds >= 20 * 60;

    const codesEarned = [];

    if (ccmEligible) {
      codesEarned.push({ code: 'ccm_99490', units: 1 });

      const additionalMinutes = Math.max(0, ccmTimeSeconds - 20 * 60);
      const additional20MinBlocks = Math.floor(additionalMinutes / (20 * 60));
      if (additional20MinBlocks > 0) {
        codesEarned.push({ code: 'ccm_99439', units: additional20MinBlocks });
      }
    }

    await db
      .update(billingPeriodSummaries)
      .set({
        ccmTimeSeconds,
        ccmEligible,
        codesEarned: sql`${billingPeriodSummaries.codesEarned} || ${JSON.stringify(codesEarned)}::jsonb`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(billingPeriodSummaries.patientId, patientId),
          eq(billingPeriodSummaries.periodStart, periodStart)
        )
      );
  }
}
```

---

## 11. Build Order & Priorities

### 11.1 Phase 1: Foundation (Week 1-2)

**Database & Backend Core**
- [ ] Drizzle schema setup with all tables
- [ ] Drizzle migrations
- [ ] NestJS project structure
- [ ] Authentication module (Supabase integration)
- [ ] Users, Patients, Clinicians modules
- [ ] i18n service with auto-translation

**Frontend Foundation**
- [ ] Next.js project setup
- [ ] next-intl configuration
- [ ] Design tokens and Tailwind config
- [ ] Primitive components (Button, Card, Input, etc.)
- [ ] Brand configuration

### 11.2 Phase 2: Patient Core (Week 3-4)

**Priority 0 - Entry Points**
- [ ] Login page
- [ ] Patient dashboard
- [ ] Bottom navigation
- [ ] Vitals module (log, view, trends)
- [ ] BMI tracking with GLP-1 eligibility

**Priority 1 - Engagement**
- [ ] Care plan viewer
- [ ] Task completion
- [ ] Messages (with translation)
- [ ] Appointments view

### 11.3 Phase 3: Clinician Core (Week 5-6)

**Dashboard & Patients**
- [ ] Clinician layout with sidebar
- [ ] Clinician dashboard
- [ ] Patient list with search
- [ ] Patient detail view
- [ ] Vitals review

**Clinical Workflows**
- [ ] Care plan management
- [ ] Task management
- [ ] Messaging (clinician side)

### 11.4 Phase 4: Advanced Features (Week 7-8)

**Labs & Medications**
- [ ] Lab orders
- [ ] Lab results with interpretation
- [ ] Medications list
- [ ] Adherence tracking
- [ ] Refill requests

**Alerts & Billing**
- [ ] Alert rules engine
- [ ] Alert management
- [ ] RPM time tracking
- [ ] CCM time tracking
- [ ] Billing dashboard

### 11.5 Phase 5: Polish & Launch (Week 9-10)

**Remaining Features**
- [ ] Onboarding flow
- [ ] Clinical intake
- [ ] Documents upload
- [ ] Device connections (Apple Health, etc.)
- [ ] Walk-in requests
- [ ] Visit documentation

**Testing & QA**
- [ ] Unit tests
- [ ] Integration tests
- [ ] Multi-language testing
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 12. Key Implementation Notes

### 12.1 Critical Requirements

1. **i18n First**: Every user-facing string must go through the translation system
2. **BMI as First-Class**: BMI/weight tracking prominently featured for GLP-1 program
3. **RPM/CCM Tracking**: Every clinical action must track billable time
4. **COFA Support**: Lina'la brand must support COFA community features
5. **Voice Messages**: Support voice messaging with transcription and translation

### 12.2 Translation Flow

```
Clinician creates content (English)
        ↓
Content saved with original_language = 'en'
        ↓
Patient requests content
        ↓
System checks patient's preferred_language
        ↓
If translation exists → return cached
        ↓
If not → auto-translate via OpenAI → cache → return
        ↓
Patient sees content in their language
        ↓
"Translated" indicator shown with option to see original
```

### 12.3 Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

```typescript
// src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export type Database = typeof db;
```

---

## 13. Summary

This specification provides a complete blueprint for rebuilding the MyHealthAlly / Lina'la web application with:

- **Drizzle ORM** schema for all 30+ database tables
- **Full i18n support** for 6 languages with auto-translation
- **Multi-brand architecture** for Lina'la (Guam) and MyHealthAlly (International)
- **RPM/CCM billing integration** for chronic care management
- **Complete component library** with medical-specific components
- **Patient and Clinician apps** with distinct UX patterns
- **BMI/GLP-1 tracking** as a first-class feature

Hand this to Cursor with the instruction: "Build this application following the specification. Start with Phase 1: Database schema and backend foundation."
