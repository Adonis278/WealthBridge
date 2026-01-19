import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C85C0E", // Pumpkin Orange
        secondary: "#8B4513", // Chestnut Brown
        accent: "#F2C57C", // Golden Wheat
        background: "#FFF8E7", // Cream Beige
        darkwood: "#6A4E23", // Dark Wood
        amber: "#FFAC4A", // Amber Glow
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      backgroundImage: {
        "gradient-fall": "linear-gradient(135deg, #FFAC4A 0%, #C85C0E 100%)",
        "gradient-sunset": "linear-gradient(180deg, #FFAC4A 0%, #C85C0E 50%, #8B4513 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
