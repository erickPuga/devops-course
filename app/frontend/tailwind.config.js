/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef9ee',
          100: '#fdf0d3',
          200: '#fadd9f',
          300: '#f7c360',
          400: '#f4a626',
          500: '#f18a0c',
          600: '#d96b06',
          700: '#b44e09',
          800: '#913d0e',
          900: '#76340f',
          950: '#411904',
        },
        green: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

