import { describe, it, expect } from "vitest";
import path from "path";
import webpack from "webpack";
import { StyleThisPlugin } from "../src/index";
import { noopAtomicProgramFile } from "../src/loaders/consts";

/** The loaders the rules of `StyleThisPlugin` apply to `request`. */
const loadersOf = (request: string) => {
  const { ruleSet } = webpack({ plugins: [new StyleThisPlugin()] }).newCompilationParams().normalModuleFactory;
  const [resource, resourceQuery = ""] = request.split(/(?=\?)/);
  return ruleSet
    .exec({ resource, resourceQuery, dependency: "esm", issuer: "", issuerLayer: "" })
    .flatMap((effect) => (effect.type === "use" ? [path.basename(effect.value.loader)] : []));
};

describe("StyleThisPlugin", () => {
  it.each([
    ["/app/a.js", ["transformLoader.mjs"]],
    ["/app/a.js?raw", []],
    [`${noopAtomicProgramFile}?filepath=a.js`, ["atomicProgramLoader.mjs"]],
    ["/app/node_modules/lib/a.js", []],
    ["/app/node_modules_lib/a.js", ["transformLoader.mjs"]],
  ])("applies the loaders of %s", (request, expected) => {
    expect(loadersOf(request)).toEqual(expected);
  });
});
