import { describe, test } from "vitest";
import { evaluateProgramBothModes, getResolver } from "./util/testUtil";

describe("styled-components-solid", () => {
  test("styled-components-solid-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
});
