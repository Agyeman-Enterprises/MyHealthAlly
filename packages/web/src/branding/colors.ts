/**
 * MyHealthAlly Brand Color Palette
 * Calm, modern, green/teal aesthetic for healthcare
 */

export const brandColors = {
  // Primary Teal/Green Palette
  primary: {
    50: '#E0F2EF',   // primarySoft - lightest
    100: '#B8E5DE',
    200: '#8FD8CD',
    300: '#66CBBC',
    400: '#47C1B9',  // accent
    500: '#2A7F79',  // primary - main brand color
    600: '#1B5854',  // primaryDark
    700: '#0F3D3A',
    800: '#082220',
    900: '#040F0E',
  },

  // Background & Surface
  background: {
    bg: '#F4F8F7',        // Soft mint-tinted white
    surface: '#FFFFFF',    // Pure white
    surfaceSoft: '#F9FBFB', // Very subtle tint
  },

  // Text Colors
  text: {
    primary: '#0F172A',    // Near black
    secondary: '#4B5563',  // textSoft - medium gray
    tertiary: '#6B7280',   // Lighter gray
    disabled: '#9CA3AF',   // Light gray
  },

  // Border & Divider
  border: {
    light: '#E2E8F0',      // Soft gray
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },

  // Semantic Colors (Muted, Professional)
  semantic: {
    success: '#4CAF50',    // Calm green
    warning: '#B8860D',    // Dark goldenrod (muted, not bright)
    error: '#DC2626',      // Soft red
    info: '#2A7F79',       // Uses primary teal
  },

  // Neutral Grays
  neutral: {
    50: '#F5F7F8',
    100: '#FFFFFF',
    200: '#E5E7EB',
    300: '#C6CDD3',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#5B6671',
    700: '#374151',
    800: '#1F2937',
    900: '#1A1A1A',
  },
} as const;

// Tailwind-compatible export
export const tailwindColors = {
  'myh-bg': brandColors.background.bg,
  'myh-surface': brandColors.background.surface,
  'myh-surfaceSoft': brandColors.background.surfaceSoft,
  'myh-primary': brandColors.primary[500],
  'myh-primarySoft': brandColors.primary[50],
  'myh-accent': brandColors.primary[400],
  'myh-text': brandColors.text.primary,
  'myh-textSoft': brandColors.text.secondary,
  'myh-border': brandColors.border.light,
  'myh-error': brandColors.semantic.error,
  'myh-warning': brandColors.semantic.warning,
  'myh-success': brandColors.semantic.success,
} as const;

