# MyHealthAlly Brand Kit

Complete design system and brand assets for MyHealthAlly.

## Design Philosophy

**Calm, Modern, Clinical Clarity**

MyHealthAlly uses a soft, professional palette designed to reduce anxiety and promote trust in healthcare settings. The aesthetic is clean, modern, and approachable—never harsh or clinical.

## Color Palette

### Primary Colors
- **Primary Teal**: `#2A7F79` - Main brand color, calm and trustworthy
- **Accent Teal**: `#47C1B9` - Lighter accent for highlights
- **Primary Soft**: `#E0F2EF` - Light background tint

### Backgrounds
- **Background**: `#F4F8F7` - Soft mint-tinted white
- **Surface**: `#FFFFFF` - Pure white for cards
- **Surface Soft**: `#F9FBFB` - Subtle tinted surface

### Text
- **Primary Text**: `#0F172A` - Near black for readability
- **Secondary Text**: `#4B5563` - Medium gray for supporting text

### Semantic Colors (Muted)
- **Success**: `#4CAF50` - Calm green
- **Warning**: `#B8860D` - Dark goldenrod (not bright yellow)
- **Error**: `#DC2626` - Soft red

## Typography

**Font Family**: Inter (Google Fonts)

- Clean, modern sans-serif
- Excellent readability at all sizes
- Professional healthcare aesthetic

### Type Scale
- Display: 48px (bold)
- Headline: 36px (semibold)
- Title: 30px (semibold)
- Subtitle: 20px (medium)
- Body: 16px (normal)
- Body Small: 14px (normal)
- Caption: 12px (normal, muted)

## Spacing System

Based on 4px base unit:
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## Border Radius

- Small: 8px
- Medium: 12px
- Large: 16px
- XL: 24px

## Shadows

- **Small**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **Medium**: `0 4px 6px rgba(0, 0, 0, 0.07)`
- **Large**: `0 10px 15px rgba(0, 0, 0, 0.1)`
- **Soft**: `0 2px 8px rgba(42, 127, 121, 0.08)` - Teal-tinted for cards

## Icons

- **Size**: 24px standard
- **Style**: Line icons, 1.5px stroke
- **Library**: Lucide React (or similar)

## Logo

- **Icon**: Teal health cross/circle
- **Wordmark**: "MyHealthAlly" in Inter semibold
- **Colors**: Primary teal on white, or white on primary teal

## Usage in Code

### Tailwind Classes
```tsx
// Backgrounds
className="bg-myh-bg"           // Main background
className="bg-myh-surface"      // Card background
className="bg-myh-primary"      // Primary teal

// Text
className="text-myh-text"       // Primary text
className="text-myh-textSoft"   // Secondary text

// Borders
className="border-myh-border"   // Light border
```

### Direct Import
```tsx
import { brandColors, tailwindColors } from '@/branding/colors';
```

## Design Principles

1. **Calm Over Flashy**: No neon colors, no harsh contrasts
2. **Clinical Clarity**: Information hierarchy is clear and readable
3. **Accessible**: WCAG AA compliant color contrasts
4. **Consistent**: Use design tokens, never hardcode colors
5. **Professional**: Investor-grade polish throughout

## File Structure

```
/branding/
  ├── colors.ts          # Color palette definitions
  ├── fonts.css          # Typography system
  ├── logo.svg           # Logo SVG
  └── readme.md          # This file
```

