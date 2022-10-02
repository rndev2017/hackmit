/** @type {import('tailwindcss').Config} */ 
module.exports = {
  darkMode: "media",
  content: ["./static/templates/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}