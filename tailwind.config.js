/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#071325', // Abyss dark
          900: '#0B1E36', // Deep water background
          850: '#0F2643', // Card background
          800: '#153258', // Elevated surface
          700: '#1C4376', // Border / secondary
          600: '#0284C7', // Primary blue
          500: '#0EA5E9', // Light blue accent
          400: '#38BDF8', // Bright blue text
        },
        aqua: {
          500: '#06B6D4', // Vibrant turquoise/aqua
          400: '#22D3EE', // Bright aqua glow
          300: '#67E8F9', // Soft cyan
        },
        emerald: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15), rgba(7, 19, 37, 1) 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(15, 38, 67, 0.9) 0%, rgba(11, 30, 54, 0.95) 100%)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
