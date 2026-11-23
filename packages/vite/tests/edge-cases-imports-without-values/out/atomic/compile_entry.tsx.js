// /packages/vite/tests/edge-cases-imports-without-values/entry.tsx: {"Object", "Size", "Theme", "box", "css", "pick", "scale", "types"}
"use strict";
const types = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-imports-without-values/types.ts"];
const Theme = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-imports-without-values/types.ts"]["Theme"];
const Size = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-imports-without-values/types.ts"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let pick = (theme) => theme.color;
let scale = (size) => size.value * 2;
let box = new String("box-63wxif");
box.css = `color: ${pick({ color: "red" })};
  width: ${scale({ value: 4 })}px;
  z-index: ${Object.keys(types).length};`;
return {
"box": box.css
};


// /packages/vite/tests/edge-cases-imports-without-values/types.ts (/packages/vite/tests/edge-cases-imports-without-values/entry.tsx): {"Theme", "__global__export__", "__star__"}
"use strict";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-imports-without-values/types.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-imports-without-values/types.ts"] ?? {}), };