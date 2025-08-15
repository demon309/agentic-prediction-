import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        'divine-gold': {
          DEFAULT: 'var(--divine-gold)',
          dark: 'var(--divine-gold-dark)',
          light: 'var(--divine-gold-light)',
        },
        'divine-black': 'var(--divine-black)',
        'divine-gray': {
          DEFAULT: 'var(--divine-gray)',
          light: 'var(--divine-gray-light)',
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gold": "pulse-gold 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "from": { boxShadow: "0 0 20px hsla(51, 78%, 42%, 0.3)" },
          "to": { boxShadow: "0 0 30px hsla(51, 78%, 42%, 0.5)" },
        },
      },
      backgroundImage: {
        'divine-gradient': 'linear-gradient(135deg, hsl(0, 0%, 0%) 0%, hsl(0, 0%, 6.7%) 50%, hsl(47, 85%, 8%) 100%)',
        'gold-gradient': 'linear-gradient(135deg, hsl(51, 78%, 42%) 0%, hsl(51, 100%, 50%) 100%)',
        'card-gradient': 'linear-gradient(135deg, hsl(0, 0%, 6.7%) 0%, hsl(0, 0%, 10.2%) 100%)',
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
