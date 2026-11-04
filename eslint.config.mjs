import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Librerías de terceros copiadas a public/ por scripts/fetch-models.mjs
    // y la presentación 3D estática: no son código nuestro.
    "public/mediapipe/**",
    "public/tesseract/**",
    "public/ort/**",
    "public/analiticas-3d/**",
    // Worktrees de sesiones paralelas (cada una se lintea por su cuenta).
    ".claude/**",
  ]),
  {
    // Scripts CommonJS de Node: require() es lo esperado.
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
