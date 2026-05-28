/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      colors: {
        space: {
          dark: '#030303',
          deep: '#06060f',
          midnight: '#0d0e1a',
          purple: '#191428',
          glow: '#5e43f3',
          cyan: '#00e1ff',
          silver: '#d1d5db',
        }
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-slow': 'glow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.3', filter: 'blur(8px)' },
          '50%': { opacity: '0.8', filter: 'blur(12px)' },
        }
      }
    },
  },
  plugins: [],
}
