/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg-primary': 'var(--app-bg-primary)',
        'app-bg-secondary': 'var(--app-bg-secondary)',
        'app-bg-tertiary': 'var(--app-bg-tertiary)',
        'app-bg-hover': 'var(--app-bg-hover)',
        'app-text-primary': 'var(--app-text-primary)',
        'app-text-secondary': 'var(--app-text-secondary)',
        'app-text-muted': 'var(--app-text-muted)',
        'app-border': 'var(--app-border)',
        'app-accent': 'var(--app-accent)',
        'app-accent-hover': 'var(--app-accent-hover)',
      }
    },
  },
  plugins: [],
}
