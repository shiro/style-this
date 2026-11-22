import { describe, it, beforeAll } from "vitest";
import { join } from "path";
import { runBuild, cleanBuildDir, assertBuildOutputMatchesSnapshot } from "../vitest.setup";

const EXAMPLE_DIR = join(import.meta.dirname, "../../sveltekit-3");
const BUILD_DIR = join(EXAMPLE_DIR, "build");
const SNAPSHOT_DIR = join(import.meta.dirname, "__snapshots__/sveltekit-3");

// SvelteKit embeds its version (a timestamp by default) into the output
const ENV = { SVELTEKIT_VERSION: "test" };

describe("sveltekit-3", () => {
  describe("regular", () => {
    beforeAll(() => {
      cleanBuildDir(BUILD_DIR);
      runBuild(EXAMPLE_DIR, "pnpm build", ENV);
    });

    it("matches snapshot", async () => {
      await assertBuildOutputMatchesSnapshot(BUILD_DIR, join(SNAPSHOT_DIR, "regular"));
    });
  });

  describe("atomic", () => {
    beforeAll(() => {
      cleanBuildDir(BUILD_DIR);
      runBuild(EXAMPLE_DIR, "pnpm build", { ...ENV, ATOMIC: "1" });
    });

    it("matches snapshot", async () => {
      await assertBuildOutputMatchesSnapshot(BUILD_DIR, join(SNAPSHOT_DIR, "atomic"));
    });
  });
});
