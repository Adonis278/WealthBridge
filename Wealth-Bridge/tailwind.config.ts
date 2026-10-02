import type { Config } from "tailwindcss";

/**
 * Make a CSS-variable color respond to Tailwind's `/NN` opacity modifier.
 * `<alpha-value>` is replaced with the modifier (or 1 when there is none).
 */
const withAlpha = (variable: string) =>
  `color-mix(in srgb, var(${variable}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Plain `var(--x)` colors cannot take Tailwind's `/NN` opacity modifier —
      // the app used ~100 of them (bg-primary/10, border-accent/30, …) and every
      // one silently rendered at full opacity. color-mix keeps the CSS variables
      // as-is while making the alpha modifier work.
      colors: {
        primary: withAlpha("--primary"),
        secondary: withAlpha("--secondary"),
        accent: withAlpha("--accent"),
        background: withAlpha("--background"),
        darkwood: withAlpha("--darkwood"),
        amber: withAlpha("--amber"),
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "serif"],
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
