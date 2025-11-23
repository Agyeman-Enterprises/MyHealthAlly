import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2A7F79",
          dark: "#1B5854",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#D64545",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#47C1B9",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "#4CAF50",
        },
        warning: {
          DEFAULT: "#B8860B", // Dark goldenrod - more muted, professional
        },
        error: {
          DEFAULT: "#D64545",
        },
        neutral: {
          50: "#F5F7F8",
          100: "#FFFFFF",
          300: "#C6CDD3",
          600: "#5B6671",
          900: "#1A1A1A",
        },
        myh: {
          bg: "#F4F8F7",
          surface: "#FFFFFF",
          surfaceSoft: "#F9FBFB",
          primary: "#2A7F79",
          primarySoft: "#E0F2EF",
          accent: "#47C1B9",
          text: "#0F172A",
          textSoft: "#4B5563",
          border: "#E2E8F0",
          error: "#DC2626",
          warning: "#B8860D",
        },
        clinician: {
          primary: {
            DEFAULT: "#0FB5B3",
            soft: "#1EC5A5",
          },
          bg: "#F3FAFB",
          surface: "#FFFFFF",
          panel: "#ECF7F7",
          text: "#123047",
          textMuted: "#6B7C93",
          good: "#16A34A",
          warning: "#F97316",
          danger: "#EF4444",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

