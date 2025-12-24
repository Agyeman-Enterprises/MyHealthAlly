## 5. API Structure (NestJS)

### 5.1 Module Structure

```
/packages/api
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── language.decorator.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── patient-access.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── language.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── dto/
│   │       ├── pagination.dto.ts
│   │       └── response.dto.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── patients/
│   │   ├── clinicians/
│   │   ├── vitals/
│   │   ├── care-plans/
│   │   ├── encounters/
│   │   ├── messages/
│   │   ├── tasks/
│   │   ├── labs/
│   │   ├── medications/
│   │   ├── alerts/
│   │   ├── billing/
│   │   ├── documents/
│   │   ├── devices/
│   │   ├── notifications/
│   │   ├── i18n/
│   │   ├── analytics/
│   │   └── scheduling/
│   └── config/
```

### 5.2 API Endpoints Summary

```yaml
# Authentication
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/verify-phone

# Users
GET    /api/users/me
PATCH  /api/users/me
PATCH  /api/users/me/language        # Update language preference
PATCH  /api/users/me/notifications
DELETE /api/users/me

# Patients
GET    /api/patients                    # List (clinician)
GET    /api/patients/:id                # Detail
PATCH  /api/patients/:id                # Update
GET    /api/patients/:id/summary        # Dashboard summary
GET    /api/patients/:id/timeline       # Activity timeline

# Patient Profile (self)
GET    /api/patient/profile
PATCH  /api/patient/profile
GET    /api/patient/dashboard
GET    /api/patient/onboarding-status

# Vitals
POST   /api/vitals                      # Log vital
GET    /api/vitals                      # List (filtered)
GET    /api/vitals/:id                  # Detail
GET    /api/vitals/trends               # Trend data
GET    /api/vitals/latest               # Latest readings
GET    /api/patients/:id/vitals         # Patient vitals (clinician)
GET    /api/patients/:id/vitals/trends  # Patient trends (clinician)

# Care Plans
GET    /api/care-plans                  # List
POST   /api/care-plans                  # Create (clinician)
GET    /api/care-plans/:id              # Detail
PATCH  /api/care-plans/:id              # Update
GET    /api/care-plans/:id/progress     # Progress summary
POST   /api/care-plans/:id/sections     # Add section
POST   /api/care-plans/:id/items        # Add item
POST   /api/care-plans/:id/items/:itemId/complete  # Mark complete (patient)

# Encounters
GET    /api/encounters                  # List
POST   /api/encounters                  # Schedule
GET    /api/encounters/:id              # Detail
PATCH  /api/encounters/:id              # Update
POST   /api/encounters/:id/check-in
POST   /api/encounters/:id/start
POST   /api/encounters/:id/end
POST   /api/encounters/:id/orders       # Add order
GET    /api/encounters/:id/summary      # Visit summary

# Walk-in Requests
POST   /api/walk-in-requests            # Create request (patient)
GET    /api/walk-in-requests            # List (clinician)
PATCH  /api/walk-in-requests/:id        # Respond (clinician)

# Messages
GET    /api/messages/threads            # List threads
POST   /api/messages/threads            # Create thread
GET    /api/messages/threads/:id        # Get thread with messages
POST   /api/messages/threads/:id/messages  # Send message
PATCH  /api/messages/threads/:id/read   # Mark read
POST   /api/messages/:id/translate      # Translate message

# Tasks
GET    /api/tasks                       # List
POST   /api/tasks                       # Create
GET    /api/tasks/:id                   # Detail
PATCH  /api/tasks/:id                   # Update
POST   /api/tasks/:id/complete          # Complete
POST   /api/tasks/:id/comments          # Add comment

# Labs
GET    /api/labs                        # List orders
POST   /api/labs                        # Create order (clinician)
GET    /api/labs/:id                    # Order detail
GET    /api/labs/:id/results            # Results
POST   /api/labs/:id/review             # Review (clinician)
GET    /api/labs/history                # Result history for trending

# Medications
GET    /api/medications                 # List
POST   /api/medications                 # Create (clinician)
PATCH  /api/medications/:id             # Update
DELETE /api/medications/:id             # Discontinue
POST   /api/medications/:id/adherence   # Log adherence (patient)
POST   /api/medications/:id/refill-request  # Request refill

# Alerts
GET    /api/alerts                      # List
GET    /api/alerts/:id                  # Detail
POST   /api/alerts/:id/acknowledge      # Acknowledge
POST   /api/alerts/:id/resolve          # Resolve

# Alert Rules
GET    /api/alert-rules                 # List
POST   /api/alert-rules                 # Create
PATCH  /api/alert-rules/:id             # Update
DELETE /api/alert-rules/:id             # Delete

# Billing (RPM/CCM)
GET    /api/billing/summary             # Current period summary
GET    /api/billing/time-entries        # Time entries
POST   /api/billing/time-entries        # Log time
GET    /api/billing/periods             # Historical periods
GET    /api/billing/periods/:id         # Period detail
POST   /api/billing/periods/:id/submit  # Submit for billing

# Documents
GET    /api/documents                   # List
POST   /api/documents                   # Upload
GET    /api/documents/:id               # Detail/download
DELETE /api/documents/:id               # Delete

# Devices
GET    /api/devices                     # List connected
POST   /api/devices/connect             # Connect device
DELETE /api/devices/:id                 # Disconnect
POST   /api/devices/:id/sync            # Manual sync
GET    /api/devices/:id/sync-log        # Sync history

# Notifications
GET    /api/notifications               # List
PATCH  /api/notifications/:id/read      # Mark read
PATCH  /api/notifications/read-all      # Mark all read
DELETE /api/notifications/:id           # Dismiss

# Translations
GET    /api/translations/:entityType/:entityId/:field  # Get translation
POST   /api/translations/:entityType/:entityId/:field  # Set translation

# Analytics
GET    /api/analytics/patient/:id/overview     # Patient analytics
GET    /api/analytics/patient/:id/hrv          # HRV trends
GET    /api/analytics/patient/:id/recovery     # Recovery scores
GET    /api/analytics/clinician/dashboard      # Clinician dashboard stats
GET    /api/analytics/practice/overview        # Practice overview

# Scheduling
GET    /api/scheduling/availability            # Get available slots
POST   /api/scheduling/book                    # Book appointment
GET    /api/scheduling/calendar                # Calendar view
```

---

## 6. Component Library

### 6.1 Structure

```
/packages/ui
├── src/
│   ├── index.ts
│   ├── primitives/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── skeleton.tsx
│   │   ├── progress.tsx
│   │   ├── checkbox.tsx
│   │   └── toast.tsx
│   ├── layout/
│   │   ├── page-header.tsx
│   │   ├── page-container.tsx
│   │   ├── section.tsx
│   │   ├── grid.tsx
│   │   └── stack.tsx
│   ├── navigation/
│   │   ├── bottom-nav.tsx          # Patient mobile nav
│   │   ├── sidebar.tsx             # Clinician sidebar
│   │   ├── top-bar.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── nav-link.tsx
│   ├── vitals/
│   │   ├── vital-card.tsx
│   │   ├── vital-input.tsx
│   │   ├── vital-trend-chart.tsx
│   │   ├── bp-card.tsx
│   │   ├── hrv-card.tsx
│   │   ├── bmi-gauge.tsx           # BMI first-class
│   │   ├── glucose-chart.tsx
│   │   └── vitals-summary.tsx
│   ├── messaging/
│   │   ├── thread-list.tsx
│   │   ├── thread-item.tsx
│   │   ├── message-bubble.tsx      # With translation indicator
│   │   ├── message-input.tsx
│   │   ├── voice-recorder.tsx
│   │   └── translated-badge.tsx
│   ├── care-plan/
│   │   ├── care-plan-card.tsx
│   │   ├── section-card.tsx
│   │   ├── item-card.tsx
│   │   ├── task-checklist.tsx
│   │   ├── progress-ring.tsx
│   │   └── care-plan-timeline.tsx
│   ├── scheduling/
│   │   ├── appointment-card.tsx
│   │   ├── calendar-view.tsx
│   │   ├── time-slot-picker.tsx
│   │   ├── clinician-picker.tsx
│   │   └── appointment-form.tsx
│   ├── labs/
│   │   ├── lab-order-card.tsx
│   │   ├── lab-result-card.tsx
│   │   ├── lab-trend-mini.tsx
│   │   └── lab-table.tsx
│   ├── medications/
│   │   ├── medication-card.tsx
│   │   ├── medication-list.tsx
│   │   ├── adherence-tracker.tsx
│   │   └── refill-button.tsx
│   ├── alerts/
│   │   ├── alert-banner.tsx
│   │   ├── alert-card.tsx
│   │   ├── alert-badge.tsx
│   │   └── alert-list.tsx
│   ├── patient/
│   │   ├── patient-card.tsx
│   │   ├── patient-avatar.tsx
│   │   ├── patient-summary.tsx
│   │   └── risk-indicator.tsx
│   ├── forms/
│   │   ├── form-field.tsx
│   │   ├── form-section.tsx
│   │   ├── multi-step-form.tsx
│   │   └── intake-form.tsx
│   ├── i18n/
│   │   ├── language-selector.tsx
│   │   ├── translated-text.tsx
│   │   └── translation-indicator.tsx
│   ├── data-display/
│   │   ├── stat-card.tsx
│   │   ├── data-table.tsx
│   │   ├── timeline.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-state.tsx
│   └── charts/
│       ├── line-chart.tsx
│       ├── bar-chart.tsx
│       ├── area-chart.tsx
│       ├── pie-chart.tsx
│       └── sparkline.tsx
```

### 6.2 Key Component Examples

#### Bottom Navigation (Patient)

```typescript
// components/navigation/bottom-nav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Home, LineChart, MessageCircle, Calendar, User } from 'lucide-react';

const navItems = [
  { href: '/patient/dashboard', icon: Home, labelKey: 'nav.home' },
  { href: '/patient/analytics', icon: LineChart, labelKey: 'nav.analytics' },
  { href: '/patient/messages', icon: MessageCircle, labelKey: 'nav.messages' },
  { href: '/patient/schedule', icon: Calendar, labelKey: 'nav.schedule' },
  { href: '/patient/profile', icon: User, labelKey: 'nav.profile' },
];

interface BottomNavProps {
  unreadMessages?: number;
}

export function BottomNav({ unreadMessages = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname.startsWith(href);
          const showBadge = href === '/patient/messages' && unreadMessages > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-safe-area-inset-bottom bg-surface" />
    </nav>
  );
}
```

#### Vital Card

```typescript
// components/vitals/vital-card.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalCardProps {
  type: string;
  value: number;
  valueSecondary?: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  isAbnormal?: boolean;
  lastUpdated?: Date;
  onClick?: () => void;
}

const vitalIcons: Record<string, string> = {
  blood_pressure: '❤️',
  heart_rate: '💓',
  hrv: '📊',
  weight: '⚖️',
  bmi: '📏',
  glucose: '🩸',
  spo2: '🫁',
};

export function VitalCard({
  type,
  value,
  valueSecondary,
  unit,
  trend,
  trendPercent,
  isAbnormal,
  onClick,
}: VitalCardProps) {
  const t = useTranslations('patient.vitals');

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const formatValue = () => {
    if (type === 'blood_pressure' && valueSecondary) {
      return `${value}/${valueSecondary}`;
    }
    return value.toFixed(type === 'bmi' ? 1 : 0);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isAbnormal && 'border-danger/50 bg-danger/5'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{vitalIcons[type] || '📈'}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {t(type)}
            </span>
          </div>
          {isAbnormal && (
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">
              {t('abnormal')}
            </span>
          )}
        </div>

        <div className="mt-2">
          <span className="text-2xl font-bold">{formatValue()}</span>
          <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
        </div>

        {trend && (
          <div
            className={cn(
              'mt-2 flex items-center gap-1 text-xs',
              trend === 'up' && type !== 'weight' && 'text-danger',
              trend === 'down' && type !== 'weight' && 'text-success',
              trend === 'stable' && 'text-muted-foreground'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trendPercent && (
              <span>
                {t('trend', { direction: trend, percent: Math.abs(trendPercent) })}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Message Bubble with Translation

```typescript
// components/messaging/message-bubble.tsx
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Play, Pause, Globe } from 'lucide-react';
import { useTranslatedContent } from '@/hooks/use-translated-content';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    contentLanguage: string;
    type: 'text' | 'voice';
    voiceUrl?: string;
    voiceDurationSeconds?: number;
    sentAt: Date;
    senderRole: 'patient' | 'clinician' | 'care_coordinator';
    senderName: string;
    senderAvatarUrl?: string;
  };
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const t = useTranslations('patient.messages');
  const locale = useLocale();
  const [showOriginal, setShowOriginal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const needsTranslation = message.contentLanguage !== locale;
  const { data: translatedContent, isLoading: isTranslating } = useTranslatedContent(
    'message',
    message.id,
    'content',
    message.content,
  );

  const displayContent = showOriginal || !needsTranslation
    ? message.content
    : translatedContent?.content || message.content;

  return (
    <div className={cn('flex gap-2', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          {message.senderAvatarUrl && (
            <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} />
          )}
          <AvatarFallback>
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {!isOwnMessage && (
          <p className="mb-1 text-xs font-medium opacity-70">
            {message.senderName}
          </p>
        )}

        {message.type === 'voice' ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="h-1 rounded-full bg-current opacity-30" />
            </div>
            <span className="text-xs opacity-70">
              {Math.floor(message.voiceDurationSeconds! / 60)}:
              {String(message.voiceDurationSeconds! % 60).padStart(2, '0')}
            </span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{displayContent}</p>
        )}

        {/* Translation indicator */}
        {needsTranslation && !isOwnMessage && (
          <div className="mt-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs opacity-70 hover:opacity-100"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              <Globe className="mr-1 h-3 w-3" />
              {showOriginal ? t('showTranslation') : t('showOriginal')}
            </Button>
            {isTranslating && (
              <span className="text-xs opacity-50">{t('translating')}</span>
            )}
          </div>
        )}

        <p className={cn('mt-1 text-xs opacity-50', isOwnMessage ? 'text-right' : 'text-left')}>
          {new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
            minute: 'numeric',
          }).format(message.sentAt)}
        </p>
      </div>
    </div>
  );
}
```

#### BMI Gauge (GLP-1 First-Class)

```typescript
// components/vitals/bmi-gauge.tsx
'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface BMIGaugeProps {
  bmi: number;
  targetBmi?: number;
  glp1Eligible?: boolean;
  startBmi?: number;
}

const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-info' };
  if (bmi < 25) return { label: 'Normal', color: 'text-success' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-warning' };
  if (bmi < 35) return { label: 'Obese I', color: 'text-danger' };
  if (bmi < 40) return { label: 'Obese II', color: 'text-danger' };
  return { label: 'Obese III', color: 'text-danger' };
};

export function BMIGauge({ bmi, targetBmi, glp1Eligible, startBmi }: BMIGaugeProps) {
  const t = useTranslations('patient.vitals');
  const category = getBmiCategory(bmi);
  
  const progress = startBmi && targetBmi
    ? ((startBmi - bmi) / (startBmi - targetBmi)) * 100
    : 0;

  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📏</span>
          <span className="font-medium">{t('bmi')}</span>
        </div>
        {glp1Eligible && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            GLP-1 Eligible
          </span>
        )}
      </div>

      <div className="text-center mb-4">
        <span className="text-4xl font-bold">{bmi.toFixed(1)}</span>
        <p className={cn('text-sm font-medium', category.color)}>
          {category.label}
        </p>
      </div>

      {/* BMI Scale */}
      <div className="relative h-3 rounded-full bg-gradient-to-r from-info via-success via-warning to-danger mb-2">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow"
          style={{
            left: `${Math.min(Math.max((bmi - 15) / 30 * 100, 0), 100)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>15</span>
        <span>25</span>
        <span>30</span>
        <span>40+</span>
      </div>

      {/* Progress toward goal */}
      {startBmi && targetBmi && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to goal</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Start: {startBmi.toFixed(1)}</span>
            <span>Goal: {targetBmi.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```
