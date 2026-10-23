/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2942',
          blue: '#1b4b72',
          primary: '#1d5e96',
          lightBlue: '#eef6fc',
          green: '#15803d',
          emerald: '#059669',
          lightGreen: '#ecfdf5',
          gold: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
