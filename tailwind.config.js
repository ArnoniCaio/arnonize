/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base:      '#0a0a0f',
        surface:   '#13131f',
        elevated:  '#1a1a2e',
        border:    '#1e1e32',
        accent:    '#6366f1',
        'accent-muted': '#2d2b5e',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
