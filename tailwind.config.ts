import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          dark: 'var(--background)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          dark: 'var(--foreground)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
