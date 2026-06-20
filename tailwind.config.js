/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#151C2C',
        primary: {
          DEFAULT: '#4E8E5E', // Domo Green
          hover: '#3D7349',
        },
        secondary: {
          DEFAULT: '#6366f1', // Indigo
          hover: '#4f46e5',
        },
        accent: '#f43f5e', // Rose
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
