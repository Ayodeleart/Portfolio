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
        body: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
