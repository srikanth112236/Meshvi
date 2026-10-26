/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg, #F8FAFC)',
        surface: {
          DEFAULT: 'var(--color-surface, #FFFFFF)',
          muted: 'var(--color-surface-muted, #F1F5F9)',
        },
        navy: {
          DEFAULT: 'var(--color-navy, #102A43)',
          hover: 'var(--color-navy-hover, #173B5E)',
        },
        primary: {
          DEFAULT: 'var(--color-primary, #0284C7)',
          hover: 'var(--color-primary-hover, #0369A1)',
          soft: 'var(--color-primary-soft, #E0F2FE)',
        },
        focus: 'var(--color-focus, #38BDF8)',
        text: {
          DEFAULT: 'var(--color-text, #0F172A)',
          muted: 'var(--color-text-muted, #64748B)',
        },
        border: 'var(--color-border, #E2E8F0)',
        success: 'var(--color-success, #15803D)',
        warning: 'var(--color-warning, #B45309)',
        danger: 'var(--color-danger, #B91C1C)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
