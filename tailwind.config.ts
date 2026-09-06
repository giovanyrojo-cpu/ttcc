import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",
        panel: "#12181F",
        line: "#1F2933",
        gold: "#D4A537",
        hot: "#E4572E",
        warm: "#D4A537",
        nurture: "#4C6A8A",
      },
    },
  },
  plugins: [],
};
export default config;
