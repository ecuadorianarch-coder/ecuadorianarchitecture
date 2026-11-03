/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '430px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        ea: {
          black: '#000000',
          white: '#ffffff',
          offwhite: '#f7f7f7',
          border: '#c8c8c8',
          muted: 'rgba(0, 0, 0, 0.15)',
        },
      },
      fontFamily: {
        okcok: ['OKCOK', 'sans-serif'],
        creato: ['"Creato Display"', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        klein: ['"Klein Condensed Trial"', '"Klein Text Trial"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.12em',
      },
    },
  },
  plugins: [],
};
