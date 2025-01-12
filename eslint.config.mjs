import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "docs/**",
      "node_modules/**",
      "playwright-report/**",
      "private/**",
      "public/data/cantina.sqlite",
      "test-results/**",
    ],
  },
];

export default config;
