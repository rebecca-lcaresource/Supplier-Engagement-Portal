/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        stone: '#B6B09F',
        linen: '#EAE4D5',
        chalk: '#F2F2F2',
        white: '#FFFFFF',
        lime: '#C8F135',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        '2xl': '64px',
        '3xl': '96px',
      },
      maxWidth: {
        page: '1120px',
        content: '720px',
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
};
