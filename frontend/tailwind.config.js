/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4f46e5', hover: '#4338ca', light: '#eef2ff' },
        success: '#16a34a', warning: '#d97706', danger: '#dc2626'
      }
    }
  },
  plugins: []
}
