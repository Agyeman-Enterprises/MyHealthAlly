import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MHA Primary - Lavender
        primary: {
          50: '#FAF8FC',
          100: '#F5F3F7',
          200: '#E8E4ED',
          300: '#D4CDE0',
          400: '#B8A9C9',
          500: '#9B8AB8',
          600: '#7E6BA1',
          700: '#6B5A8A',
          800: '#574A71',
          900: '#473D5C',
          DEFAULT: '#9B8AB8',
        },
        // MHA Navy - From logo text
        navy: {
          50: '#F5F7FA',
          100: '#E8ECF2',
          200: '#D1DAE5',
          300: '#A9BACD',
          400: '#7B95B1',
          500: '#5A7A99',
          600: '#3D4F6F',
          700: '#334E68',
          800: '#2D3F52',
          900: '#243242',
          DEFAULT: '#3D4F6F',
        },
        // MHA Sky - From logo leaves
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#7BA3C4',
          600: '#5A9BC9',
          700: '#4A8AB8',
          800: '#3A7AA8',
          900: '#2A6A98',
          DEFAULT: '#7BA3C4',
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
