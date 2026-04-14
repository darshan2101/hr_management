/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        ink: {
          50: '#f7f8fa',
          100: '#eceff3',
          200: '#d5dbe5',
          300: '#b0bbcc',
          400: '#7f8aa1',
          500: '#5d6b85',
          600: '#45506a',
          700: '#363f55',
          800: '#252b3c',
          900: '#151926'
        },
        brand: {
          100: '#e8f2ff',
          200: '#c5ddff',
          300: '#9dc3ff',
          400: '#6fa3ff',
          500: '#4a7dff',
          600: '#2f5ae3',
          700: '#2446b0'
        }
      }
    }
  },
  plugins: []
};
