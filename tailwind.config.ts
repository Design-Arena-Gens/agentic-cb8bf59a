import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          900: "#0F1117",
          800: "#131722",
          700: "#181C2A",
          600: "#1F2433",
          500: "#2A3042",
          400: "#353C52",
          300: "#414A64",
          200: "#5A6687",
          100: "#7D8AAE"
        },
        accent: {
          DEFAULT: "#4E8DFF",
          soft: "#6EA1FF",
          crust: "#1A2F5C"
        }
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        smooth: "0 20px 45px -20px rgba(12, 19, 38, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
