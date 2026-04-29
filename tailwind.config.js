/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        logo:     ['BastligaOne', 'serif'],
        bastliga: ['BastligaOne', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        manrope:  ['Manrope', 'sans-serif'],
        subtitle: ['Manrope', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-black': '#000000',
        'brand-white': '#ffffff',
      },
      animation: {
        'fade-in':     'fadeIn 1s ease forwards',
        'slide-up':    'slideUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'count-pulse': 'countPulse 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:    { from: { transform: 'translateY(110%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        countPulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
    },
  },
  plugins: [],
}