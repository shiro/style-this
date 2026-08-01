import { describe, it, expect } from "vitest";
import { withStyleThis } from "../src/index";
import type { LinariaConfig } from "../src/index";

describe("StyleThis Next.js Plugin", () => {
  it("should export withStyleThis function", () => {
    expect(typeof withStyleThis).toBe("function");
  });

  it("should accept config and return modified config", () => {
    const inputConfig: LinariaConfig = {};
    const outputConfig = withStyleThis(inputConfig);
    expect(outputConfig).toBeDefined();
  });
});

