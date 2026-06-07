import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["var(--font-inter)", "system-ui", "Arial", "sans-serif"],
        mono:  ["ui-monospace", "Cascadia Code", "Source Code Pro", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          light:   "var(--brand-light)",
          dark:    "var(--brand-dark)",
        },
        // Legacy aliases kept for backward compat
        teal: {
          primary: "var(--brand)",
          accent:  "var(--brand-light)",
        },
        dashboard: {
          bg:     "var(--background)",
          card:   "var(--surface)",
          border: "var(--border)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised:  "var(--surface-raised)",
        },
        border:  "var(--border)",
        input:   "var(--input)",
        ring:    "var(--ring)",
        background: "var(--background)",
        foreground:  "var(--text-primary)",
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--text-muted)",
        },
        destructive: {
          DEFAULT:    "var(--error)",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "var(--success)",
          bg:      "var(--success-bg)",
          border:  "var(--success-border)",
          text:    "var(--success-text)",
        },
        error: {
          DEFAULT: "var(--error)",
          bg:      "var(--error-bg)",
          border:  "var(--error-border)",
          text:    "var(--error-text)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg:      "var(--warning-bg)",
          border:  "var(--warning-border)",
          text:    "var(--warning-text)",
        },
      },
      borderRadius: {
        sm:   "0.375rem",
        md:   "0.5rem",
        lg:   "0.75rem",
        xl:   "1rem",
        "2xl":"1.25rem",
      },
      boxShadow: {
        brand: "0 4px 14px rgba(15, 118, 110, 0.25)",
        "brand-lg": "0 8px 24px rgba(15, 118, 110, 0.3)",
        card:  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
