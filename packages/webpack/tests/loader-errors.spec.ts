import { describe, it, expect } from "vitest";
import styleThisLoader from "../src/index";
import cssLoader from "../src/cssLoader";

const runLoader = (loader: Function, code: string, resourcePath: string) =>
  new Promise<Error | null | undefined>((resolve) => {
    const callback = (err: Error | null | undefined) => resolve(err);
    loader.call(
      {
        resourcePath,
        async: () => callback,
        callback,
        cacheable: () => {},
        getResolve: () => () => {},
      },
      Buffer.from(code),
    );
  });

describe("webpack loader errors", () => {
  it("reports syntax errors instead of hanging", async () => {
    const filepath = "/tmp/style-this-syntax-error.tsx";

    expect(await runLoader(styleThisLoader, "const = ;", filepath)).toBeInstanceOf(Error);
    expect(await runLoader(cssLoader, "", filepath)).toBeInstanceOf(Error);
  });
});
