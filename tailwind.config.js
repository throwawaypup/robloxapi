/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#90f0c8',
        ink: '#07111f'
      }
    }
  },
  plugins: []
};
