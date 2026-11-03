/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F8F6F1',
          50: '#FCFBF9',
          100: '#F8F6F1',
          200: '#F3EFE7',
          300: '#ECE5D8',
        },
        cream: {
          DEFAULT: '#EFE9DF',
          50: '#F7F4EE',
          100: '#EFE9DF',
          200: '#E5DDCF',
          300: '#DBD0BE',
        },
        champagne: {
          DEFAULT: '#D8C6AA',
          light: '#E6DAC5',
          dark: '#BFAA8B',
        },
        charcoal: {
          DEFAULT: '#242522',
          soft: '#2F312D',
          muted: '#5A5C55',
          light: '#7A7C75',
        },
        olive: {
          DEFAULT: '#777B63',
          light: '#8E9378',
          dark: '#5D604E',
        },
        subtle: {
          border: '#E4DED4',
          divider: '#EDE7DC',
          hover: '#F2EDE4',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        'widest-luxury': '0.22em',
        'super-wide': '0.3em',
      },
      boxShadow: {
        'subtle-luxury': '0 4px 20px -2px rgba(36, 37, 34, 0.05)',
        'drawer-luxury': '-10px 0 35px -5px rgba(36, 37, 34, 0.12)',
        'modal-luxury': '0 25px 50px -12px rgba(36, 37, 34, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

