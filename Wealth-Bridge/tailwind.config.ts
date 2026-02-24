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
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        background: "var(--background)",
        darkwood: "var(--darkwood)",
        amber: "var(--amber)",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        serif: ["Fraunces", "serif"],
      },
      backgroundImage: {
        "gradient-fall": "linear-gradient(135deg, var(--amber) 0%, var(--primary) 100%)",
        "gradient-sunset": "linear-gradient(180deg, var(--amber) 0%, var(--primary) 50%, var(--secondary) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
