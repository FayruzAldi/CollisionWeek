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
        trenning: {
          50: "#EEF0FD",
          100: "#E0E3FC",
          200: "#C6CBF9",
          300: "#9FA7F5",
          400: "#757DEE",
          500: "#5850EC", // Primary Purple / Indigo from inspiration images
          600: "#4B41DE",
          700: "#3E34C7",
          800: "#332B9F",
          900: "#2B257E",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8F9FB",
          muted: "#F3F4F6",
          border: "#E9ECF2",
        },
        collision: {
          safe: "#10b981", // Emerald
          caution: "#f59e0b", // Amber
          danger: "#ef4444", // Crimson
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        "card-hover": "0 8px 24px -4px rgba(88, 80, 236, 0.08), 0 4px 12px -2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
