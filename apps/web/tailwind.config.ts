import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#39FF14',
          50:  'rgba(57,255,20,0.50)',
          25:  'rgba(57,255,20,0.25)',
          '08': 'rgba(57,255,20,0.08)',
        },
        bg: {
          void:     '#000000',
          base:     '#0a0a0a',
          elevated: '#111111',
        },
        text: {
          primary:   '#FFFFFF',
          secondary: '#888888',
          muted:     '#444444',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 8px #39FF14, 0 0 20px rgba(57,255,20,0.35)',
        'neon-lg': '0 0 16px #39FF14, 0 0 50px rgba(57,255,20,0.25)',
      },
      borderRadius: {
        sm: '2px',
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'cursor':     'cursor-blink 1s step-end infinite',
      }
    }
  },
  plugins: [],
};
export default config;
