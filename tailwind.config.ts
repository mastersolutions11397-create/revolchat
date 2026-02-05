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
        lato: ["var(--font-lato)"],
      },
      colors: {
        teal: {
          primary: "#0F766E",
          accent: "#14B8A6",
        },
        dashboard: {
          bg: "#F9FAFB",
          card: "#FFFFFF",
          border: "#E5E7EB",
        },
      },
    },
  },
  plugins: [],
};
export default config;
