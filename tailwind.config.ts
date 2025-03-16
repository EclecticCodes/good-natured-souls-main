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
        background: "#161616",
        primary: "#000000",
        primaryInteraction: "#242424",
        secondary: "#242424",
        secondaryInteraction: "#161616",
        accent: "#F0B51E",
        accentInteraction: "#d59e0f",
        text: "#FFFFFF",
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        erica: ["var(--font-erica)"],
        cormorant: ["var(--font-cormorant)"],
        homemadeApple: ["var(--font-homemadeApple)"],
        oswald: ["var(--font-oswald)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        slideInRight: "slideInRight 0.5s ease-in-out forwards",
        slideInLeft: "slideInLeft 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
