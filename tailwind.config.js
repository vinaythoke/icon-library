/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-space-grotesk)'],
      },
      colors: {
        'sarvarth-red': '#FF5350',
        'sarvarth-blue': '#45D1F4',
        'sarvarth-grey': '#808080',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      screens: {
        'xs': '375px',
        // => @media (min-width: 375px) { ... }
        
        'sm': '640px',
        // => @media (min-width: 640px) { ... }
  
        'md': '768px',
        // => @media (min-width: 768px) { ... }
  
        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }
  
        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }
  
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },
      aspectRatio: {
        'icon': '1 / 1',
      },
      gridTemplateColumns: {
        'responsive': 'repeat(auto-fill, minmax(120px, 1fr))',
        'responsive-md': 'repeat(auto-fill, minmax(150px, 1fr))',
        'responsive-lg': 'repeat(auto-fill, minmax(180px, 1fr))',
      },
    },
  },
  plugins: [],
} 