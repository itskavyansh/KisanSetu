/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kisan-green': '#10B981',
        'kisan-light-green': '#D1FAE5',
        'kisan-blue': '#3B82F6',
        'kisan-light-blue': '#DBEAFE',
        'kisan-purple': '#8B5CF6',
        'kisan-light-purple': '#EDE9FE',
        'kisan-red': '#EF4444',
        'kisan-yellow': '#F59E0B',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 