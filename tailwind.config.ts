import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue'
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1680px'
    },
    extend: {
      colors: {
        navy: {
          50: '#EAF1F4',
          100: '#CFE0E7',
          200: '#9FC1CF',
          300: '#6FA2B7',
          400: '#3F839F',
          500: '#1C5E7C',
          600: '#124A64',
          700: '#0B3954',
          800: '#082A3E',
          900: '#051B28',
          950: '#030F17'
        },
        yellow: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE788',
          300: '#FFDA4D',
          400: '#FDC81F',
          500: '#FBBA00',
          600: '#D69C00',
          700: '#A97B00',
          800: '#7C5900',
          900: '#523B00'
        },
        ink: '#0B3954',
        paper: '#FFFFFF',
        muted: '#5C7280'
      },
      fontFamily: {
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        // editorial type scale — large, confident, generous line-height for whitespace-driven layout
        'display-xl': ['clamp(3rem, 6vw, 6.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 4.8vw, 5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 3.6vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'body-lg': ['clamp(1.125rem, 1.4vw, 1.375rem)', { lineHeight: '1.5' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        eyebrow: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.14em' }]
      },
      maxWidth: {
        container: '1440px',
        prose: '65ch'
      },
      spacing: {
        section: 'clamp(4rem, 10vw, 9rem)',
        gutter: 'clamp(1.25rem, 4vw, 4rem)'
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.65, 0, 0.35, 1)'
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms'
      }
    }
  },
  plugins: []
}
