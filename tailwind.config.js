/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.{html,js,liquid}", "!./**/node_modules/**"],


  theme: {
    extend: {
      backgroundImage:{
        nothingHere:'url("/nothing-here.png")'

      }
    },
  },
  plugins: [],
}

