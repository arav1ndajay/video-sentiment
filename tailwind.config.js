/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Add this line to enable dark mode with class strategy
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // You can add dark mode specific colors here if needed
      colors: {
        // Example dark mode colors
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          text: '#E0E0E0',
        },
      },
    },
  },
  plugins: [],
};