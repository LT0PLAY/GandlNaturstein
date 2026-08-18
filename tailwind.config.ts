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
        'sage':        '#9bae9f',
        'sage-dark':   '#9bae9f',
        'sage-muted':  '#9bae9f',
        'stone-100':   '#dcdcd6',
        'stone-200':   '#9caea1',
        'stone-400':   '#9caea1',
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
