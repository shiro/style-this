import { describe, it, beforeAll } from "vitest";
import { join } from "path";
import { runBuild, cleanBuildDir, assertBuildOutputMatchesSnapshot } from "../vitest.setup";

const EXAMPLE_DIR = join(import.meta.dirname, "../../vite-solid-start-2");
const BUILD_DIR = join(EXAMPLE_DIR, ".output");
const SNAPSHOT_DIR = join(import.meta.dirname, "__snapshots__/vite-solid-start-2");

// Exclude files that contain timestamps or build-specific metadata
const EXCLUDE_PATTERNS = ["nitro.json", "public/.vite/manifest.json", "server/index.mjs"];

describe("vite-solid-start-2", () => {
  describe("regular", () => {
    beforeAll(() => {
      cleanBuildDir(BUILD_DIR);
      runBuild(EXAMPLE_DIR, "pnpm build");
    });

    it("matches snapshot", async () => {
      await assertBuildOutputMatchesSnapshot(BUILD_DIR, join(SNAPSHOT_DIR, "regular"), EXCLUDE_PATTERNS);
    });
  });

  describe("atomic", () => {
    beforeAll(() => {
      cleanBuildDir(BUILD_DIR);
      runBuild(EXAMPLE_DIR, "pnpm build", { ATOMIC: "1" });
    });

    it("matches snapshot", async () => {
      await assertBuildOutputMatchesSnapshot(BUILD_DIR, join(SNAPSHOT_DIR, "atomic"), EXCLUDE_PATTERNS);
    });
  });
});
