import { describe, it, expect } from "vitest";
import styleThisLoader from "../src/index";
import cssLoader from "../src/cssLoader";
import { runLoader } from "./util";

describe("webpack loader errors", () => {
  it("reports syntax errors instead of hanging", async () => {
    const filepath = "/tmp/style-this-syntax-error.tsx";

    expect((await runLoader(styleThisLoader, "const = ;", filepath)).err).toBeInstanceOf(Error);
    expect((await runLoader(cssLoader, "", filepath)).err).toBeInstanceOf(Error);
  });
});
