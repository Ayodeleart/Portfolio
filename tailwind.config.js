/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        oct: {
          orange: '#FF4C00',
          violet: '#7C3AED',
          blue: '#0EA5E9',
          green: '#10B981',
          pink: '#F43F5E',
          yellow: '#FACC15',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
