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
        pineLight: '#2fa987',
        amber: '#e67e22',
        amberDark: '#d45d0a',
        ocean: '#2e75b6',
        oceanDark: '#1e52a0',
        moss: '#27ae60',
        mossDark: '#1e8f54',
        error: '#ef4444',
        errorLight: '#fee2e2',
        warning: '#f59e0b',
        warningLight: '#fef3c7',
        success: '#27ae60',
        successLight: '#ecfdf5'
      },
      boxShadow: {
        soft: '0 16px 30px rgba(26, 24, 21, 0.08)',
        md: '0 4px 12px rgba(26, 24, 21, 0.1)',
        lg: '0 10px 25px rgba(26, 24, 21, 0.12)',
        xl: '0 20px 40px rgba(26, 24, 21, 0.15)'
      },
      borderRadius: {
        xl: '18px',
        lg: '14px'
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem'
      }
    }
  },
  plugins: []
};
