/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#111213',
        card: '#18191B',
        primary: {
          DEFAULT: '#3C6B4D', // Forest Jade
          hover: '#2E533B',
        },
        secondary: {
          DEFAULT: '#E29E2D', // Amber accent
          hover: '#C28420',
        },
        accent: '#F59E0B',
      },
      borderRadius: {
        card: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Sora', 'Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
