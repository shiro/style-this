import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
  {
    files: ["src/**/*.js"],
    plugins: { js, ts },
    extends: ["js/recommended", "ts/recommended"],
  },
  {
    files: ["src/**/*.spec.ts"],
    plugins: {
      js,
      ts,
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      // "vitest/max-nested-describe": ["error", { max: 3 }],
    },
    extends: ["js/recommended", "ts/recommended"],
  },
]);

