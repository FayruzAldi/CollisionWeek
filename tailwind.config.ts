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
        cw: {
          bg: "#F7F8FA",
          surface: "#FFFFFF",
          subtle: "#FAFBFC",
          sunken: "#F2F4F7",
          line: "#ECEEF3",
          "line-strong": "#DFE3EA",
          ink: "#12141A",
          muted: "#6B7280",
          faint: "#9AA1AC",
          accent: "#5850EC",
          "accent-hover": "#4B41DE",
          "accent-soft": "#EEF0FD",
          "accent-line": "#DDE0FB",
        },
        semantic: {
          danger: {
            DEFAULT: "#C0243B",
            fg: "#C0243B",
            soft: "#FDECEF",
            ring: "#E5484D",
          },
          warning: {
            DEFAULT: "#A05A00",
            fg: "#A05A00",
            soft: "#FDF3E3",
            ring: "#E9A23B",
          },
          success: {
            DEFAULT: "#17794A",
            fg: "#17794A",
            soft: "#E9F7EF",
            ring: "#22A06B",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,20,26,0.04)",
        "card-hover": "0 6px 20px -6px rgba(18,20,26,0.10)",
        modal: "0 24px 60px -20px rgba(18,20,26,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
