import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xm: "550px",
        xs: "470px",
        "0.2xs": "370px",
        "0.5xs": "400px",
        "2.5xl": "2100px",
        "1.5xl": "1350px",
        "1.7xl": "1450px",
        "1.5lg": "1200px",
        "1.7lg": "1250px",
        "1.3lg": "1100px",
        "0.5xm": "500px",
        "2md": "950px",
        "2sm": "670px",
        "0.5md": "700px",
        "1.5md": "830px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        "op-logo":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6)), url('../assets/images/daos/op.png')",
        "arb-logo":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6)), url('../assets/images/daos/arb.png')",

        "op-profile":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8)), url('../assets/images/daos/op.png')",
        "arb-profile":
          "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8)), url('../assets/images/daos/arb.png')",
      },
      colors: {
        "blue-shade-100": "#004DFF",
        "blue-shade-200": "#0500FF",
        "blue-shade-300": "#0238B3",
        "blue-shade-400": "#F1F6FF",
        "blue-shade-500": "#C6D7FF",
        "blue-shade-600": "#DDE7FF",
        "blue-shade-700": "#F5F5FF",
        "blue-shade-800": "#0040d4",
        "black-shade-100": "#7C7C7C",
        "black-shade-200": "#DEDEDE",
        "black-shade-300": "#F6F6F6",
        "black-shade-400": "#CCCCCC",
        "black-shade-500": "#4F4F4F",
        "black-shade-600": "#F5F5F5",
        "black-shade-700": "#D9D9D9",
        "black-shade-800": "#EDEDED",
        "black-shade-900": "#B9B9B9",
        "black-shade-1000": "#3E3D3D",
        "green-shade-100": "#00CE78",
        "green-shade-200": "#25d366",
        "gradient-start": "#4ade80", // green-400
        "gradient-end": "#06b6d4", // cyan-500
      },
      fontFamily: {
        quanty: ["var(--font-quanty)"],
        poppins: ["var(--font-poppins)"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-border": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 1s ease-out",
        "fade-in-down": "fade-in-down 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "fade-in-left": "fade-in-left 0.5s ease-out",
        "fade-in-right": "fade-in-right 0.5s ease-out",
        "gradient-x": "gradient-x 5s ease infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
        "gradient-border": "gradient-border 3s ease infinite",
      },
    },
  },

  darkMode: "class",
  plugins: [nextui()],
};
export default config;
