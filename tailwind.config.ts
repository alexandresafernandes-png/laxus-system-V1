import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'glow-pulse':  'glow-pulse 3s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s ease-out forwards',
        'fade-in':     'fade-in 0.5s ease-out forwards',
        'stat-fill':   'statFill 1s ease-out forwards',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1',    filter: 'drop-shadow(0 0 8px var(--aura-primary, #00d4ff))' },
          '50%':      { opacity: '0.85', filter: 'drop-shadow(0 0 28px var(--aura-primary, #00d4ff)) drop-shadow(0 0 50px var(--aura-secondary, #3d6aff))' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
