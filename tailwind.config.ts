import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Agar src folder use ho raha ho
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // 👇 Animation Code
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.9' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
      },
      animation: {
        breathing: 'breathing 2s ease-in-out infinite',
      },
      // 👆 Yahan tak
      colors: {
         // Agar aapne koi custom colors define kiye thay pehle, wo yahan aayenge
         // Example (based on your code):
         'shop-light-pink': '#fffcf8', 
      }
    },
  },
  plugins: [],
};
export default config;