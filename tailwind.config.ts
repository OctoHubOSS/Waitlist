import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        'github-dark': '#0d1117',
        'github-dark-secondary': '#161b22',
        'github-border': '#30363d',
        'github-accent': '#238636',
        'github-accent-hover': '#2ea043',
        'github-text': '#c9d1d9',
        'github-text-secondary': '#8b949e',
        'github-link': '#58a6ff',
        'github-link-hover': '#79c0ff',
        'neon-purple': '#9333ea',
        'neon-blue': '#3b82f6',
        'neon-cyan': '#06b6d4',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'github-gradient': 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
      },
      boxShadow: {
        'github': '0 0 0 1px #30363d',
        'github-hover': '0 0 0 1px #58a6ff',
        'neon': '0 0 15px rgba(147, 51, 234, 0.5)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
