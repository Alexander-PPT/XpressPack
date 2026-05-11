/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      colors: {
        ink: '#1b1a19',
        sand: '#f7f4ef',
        clay: '#e8e0d4',
        pine: '#1f8a70',
        pineDark: '#146b57',
        amber: '#e67e22',
        ocean: '#2e75b6',
        moss: '#27ae60'
      },
      boxShadow: {
        soft: '0 16px 30px rgba(26, 24, 21, 0.08)'
      },
      borderRadius: {
        xl: '18px',
        lg: '14px'
      }
    }
  },
  plugins: []
};
