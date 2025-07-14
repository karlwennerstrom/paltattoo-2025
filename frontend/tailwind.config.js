/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Neon-inspired dark theme
        primary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Neon green accent - main brand color
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Main neon green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Background colors for dark theme
        background: {
          DEFAULT: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#111111',
          card: '#1a1a1a',
        },
        // Border colors with subtle glow effect
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.2)',
          neon: 'rgba(34, 197, 94, 0.3)',
        },
        // Status colors matching neon theme
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #22c55e, #16a34a)',
        'gradient-dark': 'linear-gradient(to bottom, #000000, #0a0a0a)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(34, 197, 94, 0.5)',
        'neon-lg': '0 0 40px rgba(34, 197, 94, 0.5)',
        'neon-xl': '0 0 60px rgba(34, 197, 94, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(34, 197, 94, 0.1)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.4)',
        'glow-hover': '0 0 25px rgba(34, 197, 94, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { 
            'box-shadow': '0 0 20px rgba(34, 197, 94, 0.5)',
            'border-color': 'rgba(34, 197, 94, 0.5)',
          },
          '100%': { 
            'box-shadow': '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)',
            'border-color': 'rgba(34, 197, 94, 0.8)',
          },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        neonPulse: {
          '0%': { 
            'box-shadow': '0 0 15px rgba(34, 197, 94, 0.4)',
            'text-shadow': '0 0 10px rgba(34, 197, 94, 0.8)',
          },
          '100%': { 
            'box-shadow': '0 0 25px rgba(34, 197, 94, 0.6)',
            'text-shadow': '0 0 15px rgba(34, 197, 94, 1)',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'xl-purple': '0 20px 25px -5px rgba(168, 85, 247, 0.1), 0 10px 10px -5px rgba(168, 85, 247, 0.04)',
        'lg-purple': '0 10px 15px -3px rgba(168, 85, 247, 0.1), 0 4px 6px -2px rgba(168, 85, 247, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}