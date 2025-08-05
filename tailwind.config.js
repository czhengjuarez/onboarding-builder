/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#8F1F57',
          600: '#7c1d4f',
          700: '#6b1a47',
          800: '#5a173f',
          900: '#4a1437',
        },
      },
    },
  },
  plugins: [],
}
