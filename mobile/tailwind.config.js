/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1D4ED8',
        'primary-light': '#3B82F6',
        secondary: '#0F172A',
        'secondary-light': '#334155',
        accent: '#22C55E',
        'accent-dark': '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F1F5F9',
        surface: '#FFFFFF',
        muted: '#94A3B8',
        'muted-text': '#64748B',
        border: '#E2E8F0',
        'card-border': '#F1F5F9',
      },
      borderRadius: {
        'card': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
