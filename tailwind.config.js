/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mota: {
          dark: '#0b0f19',
          card: '#131b2e',
          accent: '#059669', // Emerald Green
          gold: '#d97706', // Amber Gold
          navy: '#1e293b',
          crimson: '#dc2626',
        }
      }
    },
  },
  plugins: [],
}
