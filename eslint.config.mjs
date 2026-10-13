import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**", ".open-next/**", ".wrangler/**", ".cloudflare/**",
    ".codex-artifacts/**", "coverage/**", "out/**", "build/**", "scratch/**",
    "next-env.d.ts", "cloudflare-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Existing untyped adapters and test fixtures remain visible as migration debt.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "@next/next/no-img-element": "warn",
      "jsx-a11y/alt-text": "warn",
      // React Compiler is not enabled. Keep its migration diagnostics visible,
      // while rules-of-hooks and exhaustive-deps retain the Next.js defaults.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
    },
  },
  {
    files: ["supabase/**/*.cjs"],
    // These provisioning/validation tools deliberately use Node CommonJS.
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
