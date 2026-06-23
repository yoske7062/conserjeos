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
        neon:      'var(--brand)',
        success:   '#2FBF71',
        info:      '#3B9EFF',
        warning:   '#F5A524',
        incident:  '#FF6B3D',
        emergency: '#E5484D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
