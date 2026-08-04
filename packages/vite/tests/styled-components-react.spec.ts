import { describe, test } from "vitest";
import { evaluateProgramBothModes, getResolver } from "./util/testUtil";

describe("styled-components-react", () => {
  test("styled-components-react-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
});
