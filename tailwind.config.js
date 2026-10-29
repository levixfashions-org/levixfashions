/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        levix: {
          orange: '#111111',
          'orange-hover': '#262626',
          'soft-orange': '#F4F4F5',
          charcoal: '#222222',
          secondary: '#777777',
          border: '#EAEAEA',
          gray: '#F8F8F8',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 4px 20px 0 rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'glass': '0 10px 30px 0 rgba(0, 0, 0, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
        'glass-elevated': '0 20px 40px -10px rgba(0, 0, 0, 0.12), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)',
        'glass-dark': '0 20px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)',
        'dock': '0 25px 60px -12px rgba(0, 0, 0, 0.18), 0 4px 16px 0 rgba(0, 0, 0, 0.06), inset 0 1px 2px 0 rgba(255, 255, 255, 0.9)',
        'dock-dark': '0 25px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '40px',
      }
    },
  },
  plugins: [],
}
