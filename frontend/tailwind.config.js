/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C97B2A',
          dark: '#8B4E0E',
          light: '#E8A84E',
          50: '#FDF5E8',
          100: '#F9E4C0',
        },
        accent: {
          DEFAULT: '#1A6B4A',
          dark: '#0F4A32',
          light: '#2A9B6A',
        },
        kora: {
          bg: '#FAF7F2',
          surface: '#FFFFFF',
          text: '#1C1917',
          muted: '#78716C',
          border: '#E7E0D8',
        },
        operator: {
          mtn: '#FFCC00',
          moov: '#0066CC',
          wave: '#1BA9FF',
          orange: '#FF6600',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(100%)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
      },
      boxShadow: {
        'kora': '0 4px 24px rgba(201, 123, 42, 0.15)',
        'kora-lg': '0 8px 40px rgba(201, 123, 42, 0.2)',
        'card': '0 2px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
