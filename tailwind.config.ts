import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("--color-canvas"),
        surface: token("--color-surface"),
        elevated: token("--color-elevated"),
        soft: token("--color-soft"),
        line: token("--color-line"),
        strong: token("--color-strong"),
        ink: token("--color-ink"),
        muted: token("--color-muted"),
        primary: {
          DEFAULT: token("--color-primary"),
          strong: token("--color-primary-strong"),
        },
        focus: token("--color-focus"),
        danger: {
          DEFAULT: token("--color-danger"),
          soft: token("--color-danger-soft"),
        },
      },
      boxShadow: {
        soft: "0 12px 40px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
