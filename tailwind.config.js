/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // The <alpha-value> syntax allows Tailwind's opacity modifiers (like bg-brand/50) to still work!
        base: 'rgb(var(--color-bg-base) / <alpha-value>)',
        surface: 'rgb(var(--color-bg-surface) / <alpha-value>)',
        main: 'rgb(var(--color-text-main) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        'theme-border': 'rgb(var(--color-border) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}