/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {        
        playfair: ['Playfair Display', 'serif'],
        cinzel:   ['Cinzel', 'serif'],
        manrope:  ['Manrope', 'sans-serif'],
        subtitle: ['Manrope', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-black': '#000000',
        'brand-white': '#ffffff',
        // KhanConcepts UI Style Guide
        'kc-black':     '#0A0A0D', // Rich Black — backgrounds
        'kc-surface':   '#111318', // Dark Surface — cards, sections
        'kc-gray':      '#1A1D22', // Deep Gray — input fields, borders
        'kc-slate':     '#2A2F3A', // Slate Gray — secondary elements
        'kc-gold':      '#D4AF37', // Gold — headings, accents, icons, highlights, buttons, CTAs (used everywhere; no Amber Gold)
        'kc-white':     '#FFFFFF', // Pure White — primary text
        'kc-soft-gray': '#B3B6BD', // Soft Gray — secondary text, placeholders
        'kc-error':     '#E53935', // Red — error states, warnings
        'kc-success':   '#4CAF50', // Green — success states
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