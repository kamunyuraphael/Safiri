import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Full Safiri brand palette (from the Figma Make design)
        earth: {
          50: "#fdf8f2",
          100: "#f5ead8",
          200: "#e8d0a9",
          300: "#d4a96a",
          400: "#c4883d",
          500: "#a96b24",
          600: "#8a531a",
        },
        terra: {
          400: "#c0522a",
          500: "#a33f1c",
          600: "#852f12",
        },
        savanna: {
          400: "#c9a227",
          500: "#a37f16",
        },
        forest: {
          700: "#2d4a2a",
          800: "#1e3320",
          900: "#121f14",
        },
        // Semantic aliases — existing components (Button, Card, etc.) use these
        background: "#fdf8f2", // earth-50
        foreground: "#1e3320", // forest-800
        primary: {
          DEFAULT: "#c0522a", // terra-400 — the design's action color
          foreground: "#fdf8f2",
        },
        accent: {
          DEFAULT: "#c9a227", // savanna-400 — gold highlight
          foreground: "#1e3320",
        },
        muted: {
          DEFAULT: "#f5ead8", // earth-100
          foreground: "#a96b24", // earth-500
        },
        border: "#e8d0a9", // earth-200
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
