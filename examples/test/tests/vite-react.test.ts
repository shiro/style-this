import { describe, it, beforeAll } from "vitest";
import { join } from "path";
import { runBuild, cleanBuildDir, assertBuildOutputMatchesSnapshot } from "../vitest.setup";

const EXAMPLE_DIR = join(import.meta.dirname, "../../vite-react");
const BUILD_DIR = join(EXAMPLE_DIR, "dist");
const SNAPSHOT_DIR = join(import.meta.dirname, "__snapshots__/vite-react");

describe("vite-react", () => {
  describe("regular", () => {
    beforeAll(() => {
      cleanBuildDir(BUILD_DIR);
      runBuild(EXAMPLE_DIR, "pnpm build");
    });

    it("matches snapshot", async () => {
      await assertBuildOutputMatchesSnapshot(BUILD_DIR, join(SNAPSHOT_DIR, "regular"));
    });
  });

  describe("atomic", () => {
    beforeAll(() => {
      cleanBuildDir(BUILD_DIR);
      runBuild(EXAMPLE_DIR, "pnpm build", { ATOMIC: "1" });
    });

    it("matches snapshot", async () => {
      await assertBuildOutputMatchesSnapshot(BUILD_DIR, join(SNAPSHOT_DIR, "atomic"));
    });
  });
});
