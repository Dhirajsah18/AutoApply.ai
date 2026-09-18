/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8f9',
          100: '#d5f0f2',
          200: '#aee3e6',
          300: '#79d1d6',
          400: '#3eb8bf',
          500: '#06969C',
          600: '#058288',
          700: '#046a6f',
          800: '#035458',
          900: '#023c3f',
          950: '#012325',
        },
        indigo: {
          50: '#eef8f9',
          100: '#d5f0f2',
          200: '#aee3e6',
          300: '#79d1d6',
          400: '#3eb8bf',
          500: '#06969C',
          600: '#058288',
          700: '#046a6f',
          800: '#035458',
          900: '#023c3f',
          950: '#012325',
        },
        blue: {
          50: '#eef8f9',
          100: '#d5f0f2',
          200: '#aee3e6',
          300: '#79d1d6',
          400: '#3eb8bf',
          500: '#06969C',
          600: '#058288',
          700: '#046a6f',
          800: '#035458',
          900: '#023c3f',
          950: '#012325',
        },
        canvas: '#f2e9e4',
        paper: '#fcf9f7',
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          surface: '#1E293B',
          border: '#334155',
          muted: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
