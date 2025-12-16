import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          primary: "#0a0b0d",
          secondary: "#12141a",
          tertiary: "#1a1d24",
          hover: "#22262f",
        },
        // Border colors
        border: {
          DEFAULT: "#2a2e38",
          active: "#3d424f",
        },
        // Text colors
        foreground: {
          DEFAULT: "#e8eaed",
          secondary: "#9aa0a6",
          muted: "#5f6368",
        },
        // Accent colors
        accent: {
          green: "#00c853",
          "green-dim": "rgba(0, 200, 83, 0.15)",
          red: "#ff5252",
          "red-dim": "rgba(255, 82, 82, 0.15)",
          blue: "#448aff",
          "blue-dim": "rgba(68, 138, 255, 0.15)",
          orange: "#ff9100",
          purple: "#e040fb",
          cyan: "#18ffff",
          yellow: "#ffea00",
        },
        // Chart specific
        chart: {
          grid: "#1e2129",
          "candle-up": "#00c853",
          "candle-down": "#ff5252",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(68, 138, 255, 0.3)",
        "glow-green": "0 0 20px rgba(0, 200, 83, 0.3)",
        "glow-red": "0 0 20px rgba(255, 82, 82, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
