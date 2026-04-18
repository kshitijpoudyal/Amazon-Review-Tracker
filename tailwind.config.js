/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HustleBooks "Synthetic Naturalist" palette
        primary: {
          DEFAULT: '#022448',
          container: '#1e3a5f',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#006a68',
          container: '#86f4f1',
          foreground: '#ffffff',
        },
        surface: {
          DEFAULT: '#fbf9f3',
          dim: '#dcdad4',
          variant: '#e4e2dd',
          'container-lowest': '#ffffff',
          'container-low': '#f5f3ee',
          'container': '#f0eee8',
          'container-high': '#eae8e2',
          'container-highest': '#e4e2dd',
        },
        'on-surface': '#1b1c19',
        'on-surface-variant': '#43474e',
        outline: {
          DEFAULT: '#74777f',
          variant: '#c4c6cf',
        },
        destructive: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        tertiary: {
          DEFAULT: '#341f00',
          container: '#503300',
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        label: ['Work Sans', 'system-ui', 'sans-serif'],
        mono: ['Work Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        squircle: '1.25rem',
        'squircle-lg': '2rem',
      },
      boxShadow: {
        navy: '0 12px 32px rgba(2, 36, 72, 0.06)',
        'navy-md': '0 12px 32px rgba(2, 36, 72, 0.10)',
        'navy-lg': '0 24px 64px rgba(2, 36, 72, 0.12)',
        card: '0 20px 40px rgba(2, 36, 72, 0.08)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
