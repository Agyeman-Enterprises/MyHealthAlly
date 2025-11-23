# MyHealthAlly Design System Implementation

## Overview

This document outlines the implementation of the Builder design system across the MyHealthAlly web application. The design system has been extracted from Builder pages and implemented as a consistent, reusable component library.

## Design System Tokens

All design tokens are defined in `packages/web/src/theme/theme.json` and exported to root `theme.json` for cross-platform use (iOS/Android).

### Colors
- **Primary**: `#1A73EB` (Builder Blue)
- **Secondary**: `#F06D41` (Coral-Orange)
- **Background**: `#F8F9FA` (Soft white-gray)
- **Surface**: `#FFFFFF` (Card background)
- **Text Primary**: `#212121` (Dark gray)
- **Text Secondary**: `#5F6368` (Muted gray)
- **Danger**: `#C62828` (Red)
- **Success**: `#16A34A` (Green)
- **Warning**: `#F97316` (Orange)

### Typography
- **Font Family**: Inter, Roboto, Helvetica Neue, sans-serif
- **H1**: 32px, semibold (600)
- **H2**: 24px, semibold (600)
- **H3**: 20px, semibold (600)
- **Body**: 16px, regular (400)
- **Caption**: 13px, regular (400)

### Spacing
- XS: 4px
- SM: 8px
- MD: 12px
- LG: 16px
- XL: 24px
- XXL: 32px

### Border Radius
- **Consistent**: 6px for all components (buttons, cards, inputs, tabs)

### Shadows
- **Card**: `0px 1px 3px rgba(0,0,0,0.08), 0px 4px 8px rgba(0,0,0,0.06)`
- **Hover**: `0px 2px 6px rgba(0,0,0,0.12), 0px 8px 16px rgba(0,0,0,0.08)`

## Component Library Structure

### Base UI Components (`/src/components/ui/`)
- ✅ **Card** - Surface container with consistent styling
- ✅ **Button** - Primary, secondary, outline, ghost, danger variants
- ✅ **Input** - Text input with label, error, and helper text support
- ✅ **Tabs** - Tab navigation component
- ✅ **Badge** - Status indicators
- ✅ **Avatar** - User profile images

### Layout Components (`/src/components/layout/`)
- ✅ **PageContainer** - Main page wrapper with max-width constraints
- ✅ **Grid** - Responsive grid system (1-12 columns)

### Specialized Widgets (`/src/components/widgets/`)
- ✅ **VitalCard** - Display vital signs (HR, BP, BMI, HRV)
- ✅ **LabCard** - Lab result display with status indicators
- ✅ **AppointmentCard** - Appointment information card

## Utility Functions (`/src/utils/`)

- ✅ **bmi.ts** - BMI calculation and categorization
- ✅ **date.ts** - Date formatting utilities (relative time, date/time strings)
- ✅ **format.ts** - Number, currency, percentage formatting
- ✅ **validators.ts** - Form validation helpers

## API Hooks (`/src/hooks/`)

- ✅ **useVitals** - Fetch and record patient vitals
- ✅ **useMetrics** - Load dynamic metrics configuration
- ✅ **useLabs** - Lab orders and results management

## Implementation Status

### ✅ Completed
1. **Theme System**
   - Theme JSON with all design tokens
   - CSS variables for runtime access
   - TypeScript types and utilities

2. **Component Library**
   - Base UI components (Card, Button, Input, Tabs)
   - Layout components (PageContainer, Grid)
   - Specialized widgets (VitalCard, LabCard, AppointmentCard)

3. **Utilities & Hooks**
   - BMI calculation utilities
   - Date formatting functions
   - API hooks for vitals, metrics, labs

4. **Example Implementation**
   - Patient Dashboard page rebuilt with new design system

### 🚧 In Progress
- Rebuilding all 24 patient pages
- BMI integration across patient pages
- Dynamic metrics system implementation
- Lab orders/results tabs

### ⏳ Pending
- Clinician portal pages
- Ohimaa content engine pages
- Referrals and documents sections
- Remove Builder artifacts

## Usage Example

```tsx
import { PageContainer } from '@/components/layout/PageContainer';
import { Grid } from '@/components/layout/Grid';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalCard } from '@/components/widgets/VitalCard';
import { useVitals } from '@/hooks/useVitals';

export default function MyPage() {
  const { vitals } = useVitals();
  
  return (
    <PageContainer>
      <Grid cols={3} gap="md">
        <VitalCard
          label="Heart Rate"
          value={vitals?.heartRate}
          unit="bpm"
          status="normal"
        />
      </Grid>
    </PageContainer>
  );
}
```

## Next Steps

1. Continue rebuilding patient pages using the established pattern
2. Implement BMI integration on profile, dashboard, and analytics pages
3. Add dynamic metrics selector and graphs
4. Build lab orders/results tabs
5. Add referrals and documents sections
6. Build clinician portal pages
7. Build Ohimaa content engine pages
8. Remove all Builder artifacts once migration is complete

## Design System Compliance

All components follow these rules:
- ✅ 6px border radius everywhere
- ✅ Consistent shadow system
- ✅ Builder color palette
- ✅ Inter/Roboto font family
- ✅ Spacing system (4px increments)
- ✅ Mobile-responsive by default

