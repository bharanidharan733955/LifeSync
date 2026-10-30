/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        nutrition: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        finance: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        sugar: {
          50: '#fff1f2',
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
    },
  },
  plugins: [],
}

