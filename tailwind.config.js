/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './pages/**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: { 'hc-red': '#fc0612' },
    },
  },
};
