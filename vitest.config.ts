import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/core",
      "packages/next",
      "packages/solid",
      "packages/vite",
      "packages/webpack",
      "examples/test",
    ],
  },
});
