/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e9edf3',
          200: '#cfd8e3',
          500: '#5b6b82',
          600: '#465267',
          700: '#333d4d',
        },
      },
    },
  },
  plugins: [],
};
