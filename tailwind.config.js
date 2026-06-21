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
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-out': 'fade-out 0.2s ease-in forwards',
        'slide-out-right': 'slide-out-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fadeIn': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
