/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F4F4',
          100: '#CCE9E9',
          200: '#99D3D3',
          300: '#66BDBD',
          400: '#33A7A7',
          500: '#0D9488', // Main teal
          600: '#0A756D',
          700: '#085752',
          800: '#053A36',
          900: '#031D1B',
        },
      },
    },
  },
  plugins: [],
};
