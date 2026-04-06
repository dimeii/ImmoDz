import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy primary palette (kept for other pages)
        primary: {
          50: "#f0f9f5",
          100: "#d4ede5",
          200: "#a8dac9",
          300: "#7cc8ae",
          400: "#50b592",
          500: "#24a277",
          600: "#1a8a60",
          700: "#137a50",
          800: "#0d6a40",
          900: "#065a31",
          950: "#007b30",
          DEFAULT: "#003527",
        },
        // Material Design 3 inspired tokens
        "on-primary": "#ffffff",
        "primary-container": "#064e3b",
        "on-primary-container": "#80bea6",
        "primary-fixed": "#b0f0d6",
        "primary-fixed-dim": "#95d3ba",
        "inverse-primary": "#95d3ba",
        surface: {
          DEFAULT: "#f7f9fb",
          dim: "#d8dadc",
          bright: "#f7f9fb",
          variant: "#e0e3e5",
        },
        "surface-container": {
          lowest: "#ffffff",
          low: "#f2f4f6",
          DEFAULT: "#eceef0",
          high: "#e6e8ea",
          highest: "#e0e3e5",
        },
        "on-surface": "#191c1e",
        "on-surface-variant": "#404944",
        outline: {
          DEFAULT: "#707974",
          variant: "#bfc9c3",
        },
        secondary: {
          DEFAULT: "#545f73",
          container: "#d5e0f8",
        },
        "on-secondary": "#ffffff",
        tertiary: {
          DEFAULT: "#630018",
          container: "#8d0026",
        },
        "accent-red": "#c9082a",
        error: "#ba1a1a",
        background: "#f7f9fb",
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
    },
  },
  plugins: [],
};

export default config;
