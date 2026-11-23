import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // the runtime only throws, the types are what's tested
    typecheck: { enabled: true, only: true },
  },
});
