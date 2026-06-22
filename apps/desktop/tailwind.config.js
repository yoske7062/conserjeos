/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:    '#0f1117',
        surface: '#1a1d27',
        border:  '#2a2d3e',
        muted:   '#6b7280',
        accent:  '#6366f1',
        urgent:  '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info:    '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
