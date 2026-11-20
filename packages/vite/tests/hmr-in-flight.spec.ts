import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { setupPlugin } from "./util/testUtil";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const VIRTUAL_PREFIX = "\0virtual:style-this:";

type Plugin = Awaited<ReturnType<typeof setupPlugin>>;

/** Evaluations of `x.tsx` wait for a gate, released by the test to control their order. */
const source = (width: string) => `import { css } from "@style-this/core";

const color = await (globalThis as any).__styleThisTestGate();

// 色: non-ASCII text, UTF-8 byte offsets of the styles differ from string indices
export const xStyle = css\`
  color: \${color};
  width: ${width};
\`;
`;

const deferred = () => {
  let resolve!: (value: string) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<string>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
};

// lets the evaluations waiting on settled gates finish
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe.each([false, true])("edits during in-flight evaluations (atomic: %s)", (atomic) => {
  let dir: string;
  let file: string;
  let plugin: Plugin;
  let gates: ReturnType<typeof deferred>[];
  let timestamp = 0;

  const environment = {
    name: "client",
    config: { consumer: "client", server: { hmr: {} } },
    hot: { send: vi.fn() },
    moduleGraph: {
      getModuleById: () => undefined,
      getModulesByFile: () => new Set(),
      invalidateModule: vi.fn(),
    },
  };

  const load = async (suffix: string) => {
    const result = await plugin.load(`${VIRTUAL_PREFIX}${file}${suffix}`);
    return typeof result === "string" ? { code: result, map: undefined } : result!;
  };

  /** Writes `x.tsx`, runs its HMR update and re-transforms it, without waiting for the evaluation. */
  const editAndTransform = async (code: string) => {
    await writeFile(file, code);
    await (plugin.hotUpdate as Function).call(
      { environment },
      { file, type: "update", timestamp: ++timestamp, modules: [], read: () => code },
    );
    await plugin.transform(code, file);
  };

  const waitForGates = (count: number) => vi.waitFor(() => expect(gates).toHaveLength(count));

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "style-this-hmr-in-flight-"));
    file = join(dir, "x.tsx");
    gates = [];
    (globalThis as any).__styleThisTestGate = () => {
      const gate = deferred();
      gates.push(gate);
      return gate.promise;
    };

    plugin = await setupPlugin({ "@style-this/core": "" }, { atomic, debug: false });
    (plugin.configureServer as Function)({ environments: { client: environment } });

    await writeFile(file, source("1px"));
    await plugin.transform(source("1px"), file);
    await waitForGates(1);
    gates[0].resolve("red");
  });

  afterEach(async () => {
    delete (globalThis as any).__styleThisTestGate;
    await rm(dir, { recursive: true, force: true });
  });

  test("stale evaluations finishing first don't resolve the new CSS", async () => {
    const initialAtomicModule = atomic ? (await load(".style-this.js")).code : undefined;

    await editAndTransform(source("2px"));
    await waitForGates(2);
    await editAndTransform(source("1px"));
    await waitForGates(3);

    gates[1].resolve("red");
    await flush();
    gates[2].resolve("red");

    if (atomic) expect((await load(".style-this.js")).code).toBe(initialAtomicModule);
    else expect((await load(".css")).code).toContain("width: 1px");
  });

  test("stale evaluations finishing last don't replace the new sourcemap", async () => {
    await editAndTransform(source("2px"));
    await waitForGates(2);
    await editAndTransform(source("1px"));
    await waitForGates(3);

    gates[2].resolve("red");
    await flush();
    gates[1].resolve("red");
    await flush();

    const { code, map } = await load(".css");
    if (!atomic) expect(code).toContain("width: 1px");
    expect(map?.sourcesContent).toEqual([source("1px")]);
  });

  test("errors of stale evaluations are reported to their own entries", async () => {
    await editAndTransform(source("2px"));
    await waitForGates(2);
    await editAndTransform(source("1px"));
    await waitForGates(3);

    gates[1].reject(new Error("stale evaluation failed"));
    await flush();
    gates[2].resolve("blue");

    if (atomic) expect((await load(".style-this.js")).code).toContain("xStyle");
    const { code } = await load(".css");
    if (!atomic) expect(code).toContain("color: blue");
  });

  test("CSS sourcemaps point to the styles' source", async () => {
    const { map } = await load(".css");
    expect(map).toMatchObject({ sources: [file], sourcesContent: [source("1px")] });
    // first segment: generated line 0, column 0 maps to `css` on line 5, column 22 (0-based)
    expect(map!.mappings.split(";")[0].split(",")[0]).toBe("AAKsB");
  });
});
