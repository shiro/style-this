import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
  {
    files: ["vitest.setup.ts"],
    plugins: { js, ts },
    extends: ["js/recommended", "ts/recommended"],
  },
  {
    files: ["tests/**/*.test.ts"],
    plugins: {
      js,
      ts,
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": ["error", { assertFunctionNames: ["assertBuildOutputMatchesSnapshot"] }],
    },
    extends: ["js/recommended", "ts/recommended"],
  },
]);
