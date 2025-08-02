/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        work: ['Work Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        monter: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'custom-healthcare': 'linear-gradient(135deg, #ffffff 0%, #dbf6ff 20%, #d3eef7 40%, #d0ebf4 60%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
};
