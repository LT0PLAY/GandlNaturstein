import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'stone-black': '#0A0806',
        'stone-card':  '#14100A',
        'sage':        '#C4923A',
        'sage-dark':   '#7A5828',
        'sage-muted':  '#7A5828',
        'stone-100':   '#F0EBE3',
        'stone-200':   '#C8BEAE',
        'stone-400':   '#6A6050',
        'stone-600':   '#1E1A10',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body:    ['var(--font-inter)',  'sans-serif'],
        serif:   ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
