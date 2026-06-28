/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:    'var(--bg-base)',
        surface: 'var(--bg-surface)',
        s2:      'var(--bg-surface-high)',
        border:  'var(--border)',
        border2: 'var(--border-strong)',
        muted:   'var(--text-muted)',
        mid:     'var(--text-secondary)',
        text:    'var(--text)',
        brand:   'var(--brand)',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
