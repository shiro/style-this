import { describe, it, beforeAll, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { runBuild, cleanBuildDir } from "../vitest.setup";

const EXAMPLE_DIR = join(import.meta.dirname, "../../next");
const BUILD_DIR = join(EXAMPLE_DIR, ".next");
const SNAPSHOT_DIR = join(import.meta.dirname, "__snapshots__/next");
const PAGES = ["app/index", "app/about", "pages/pages-router"];
const BUILD_TIMEOUT = 120_000;

// Next's output is full of build IDs and hashed chunk names, so instead of the whole build dir, this snapshots the
// prerendered markup of each page (without scripts) and the CSS the page links, in order
async function assertPagesMatchSnapshot(snapshotDir: string) {
  for (const page of PAGES) {
    const html = readFileSync(join(BUILD_DIR, "server", `${page}.html`), "utf-8");
    const css = [...html.matchAll(/<link rel="stylesheet" href="\/_next\/([^"]+)"/g)]
      .map(([, href]) => readFileSync(join(BUILD_DIR, href), "utf-8").trim())
      .join("\n");
    const body = html
      .match(/<body>(.*)<\/body>/s)![1]
      .replace(/<script\b[^>]*>.*?<\/script>/gs, "")
      .replace(/<link [^>]*>/g, "");

    await expect(body).toMatchFileSnapshot(join(snapshotDir, `${page}.html`));
    await expect(css).toMatchFileSnapshot(join(snapshotDir, `${page}.css`));
  }
}

describe("next", () => {
  for (const bundler of ["turbopack", "webpack"]) {
    const command = bundler === "webpack" ? "pnpm build:webpack" : "pnpm build";

    describe(bundler, () => {
      describe("regular", () => {
        beforeAll(() => {
          cleanBuildDir(BUILD_DIR);
          runBuild(EXAMPLE_DIR, command);
        }, BUILD_TIMEOUT);

        it("matches snapshot", async () => {
          await assertPagesMatchSnapshot(join(SNAPSHOT_DIR, bundler, "regular"));
        });
      });

      describe("atomic", () => {
        beforeAll(() => {
          cleanBuildDir(BUILD_DIR);
          runBuild(EXAMPLE_DIR, command, { ATOMIC: "1" });
        }, BUILD_TIMEOUT);

        it("matches snapshot", async () => {
          await assertPagesMatchSnapshot(join(SNAPSHOT_DIR, bundler, "atomic"));
        });
      });
    });
  }
});
