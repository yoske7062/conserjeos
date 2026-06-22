/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:    '#0B0B0B',
        surface: '#161616',
        s2:      '#1F1F1F',
        border:  '#2E2E2E',
        border2: '#3D3D3D',
        muted:   '#636363',
        mid:     '#A8A8A8',
        text:    '#F5F5F5',
        neon:    '#00FF88',
        urgent:  '#FF4444',
        warning: '#FFAA00',
        success: '#00CC6A',
        info:    '#D0D0D0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
