import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import transformLoader from "../src/loaders/transformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { resolveRequest, runLoader, virtualImport } from "./util";

const dir = "/tmp/style-this-webpack-hmr";
mkdirSync(dir, { recursive: true });

describe("dev edits", () => {
  it("serves the CSS of files gaining and losing styles", async () => {
    const filepath = `${dir}/gaining.tsx`;
    const transform = async (code: string) => {
      writeFileSync(filepath, code);
      const { err, result } = await runLoader(transformLoader, code, filepath);
      expect(err).toBeNull();
      return result!;
    };
    const css = async (cssImport: string) => runLoader(cssLoader, "", cssImport);
    const styled = (color: string) => `import { css } from "@style-this/core";
export const cls = css\`
  color: ${color};
\`;
`;
    const unstyled = `export const value = 1;\n`;

    expect(await transform(unstyled)).toBe(unstyled);
    const cssImport = virtualImport(filepath, await transform(styled("red")), "style-this.css");
    expect(await css(cssImport)).toEqual({ err: null, result: expect.stringContaining("color: red") });

    // the CSS loader runs again on edits, while the stylesheet is still imported
    expect(await transform(unstyled)).toBe(unstyled);
    expect(await css(cssImport)).toEqual({ err: null, result: "" });

    await transform(styled("blue"));
    expect(await css(cssImport)).toEqual({ err: null, result: expect.stringContaining("color: blue") });
  });

  it("serves the CSS of files whose dependencies changed", async () => {
    const filepath = `${dir}/importer.tsx`;
    const code = `import { css } from "@style-this/core";
import { color } from "./theme.ts";
import size from "./size.txt?raw";
export const cls = css\`
  color: \${color};
  width: \${size}px;
\`;
`;
    writeFileSync(filepath, code);
    writeFileSync(`${dir}/theme.ts`, `export { color } from "./palette.ts";\n`);
    const palette = (color: string) => writeFileSync(`${dir}/palette.ts`, `export const color = "${color}";\n`);
    palette("red");
    writeFileSync(`${dir}/size.txt`, "1");

    // the files a loader adds as dependencies, the bundler runs it again when they change
    const dependencies = new Set<string>();
    const addDependency = (file: string) => dependencies.add(file);
    const watched = () => [...dependencies].filter((file) => file.startsWith(dir)).sort();
    const allDependencies = ["importer.tsx", "palette.ts", "size.txt", "theme.ts"].map((name) => `${dir}/${name}`);

    const transform = async (ctx = {}) => {
      const { err, result } = await runLoader(transformLoader, code, filepath, {}, ctx);
      expect(err).toBeNull();
      return result!;
    };
    const css = async () => {
      dependencies.clear();
      const { err, result } = await runLoader(cssLoader, "", cssImport, {}, { addDependency });
      expect(err).toBeNull();
      return result;
    };

    // the transform loader is done before the evaluation, the CSS loader adds the dependencies it resolves later
    let resolvePalette!: () => void;
    const paletteResolvable = new Promise<void>((resolve) => (resolvePalette = resolve));
    const getResolve = () => (context: string, request: string, cb: Parameters<typeof resolveRequest>[2]) =>
      request.includes("palette") ? paletteResolvable.then(() => resolveRequest(context, request, cb)) : resolveRequest(context, request, cb);
    const cssImport = virtualImport(filepath, await transform({ getResolve }), "style-this.css");
    const cssResult = css();
    resolvePalette();
    expect(await cssResult).toMatch(/color: red;\s+width: 1px;/);
    expect(watched()).toEqual(allDependencies);

    // the bundler runs the loaders of importers again
    palette("blue");
    await transform();
    expect(await css()).toMatch(/color: blue;\s+width: 1px;/);

    // Turbopack runs loaders in several processes, the CSS loader's process may not transform the importer again
    writeFileSync(`${dir}/size.txt`, "2");
    expect(await css()).toMatch(/color: blue;\s+width: 2px;/);

    // skipped evaluations don't resolve the imports
    dependencies.clear();
    await transform({ addDependency });
    expect(watched()).toEqual(allDependencies.filter((file) => file !== filepath));
  });
});
