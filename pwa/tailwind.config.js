/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4', // Teal primary
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        },
        error: {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#d32f2f',
          600: '#c62828',
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#388e3c',
          600: '#2e7d32',
        },
        warning: {
          50: '#fff3e0',
          100: '#ffe0b2',
          500: '#f57c00',
          600: '#ef6c00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(0, 188, 212, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
        'gradient-success': 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
        'gradient-purple': 'linear-gradient(135deg, #845ef7 0%, #7048e8 100%)',
      },
    },
  },
  plugins: [],
}
