// /packages/vite/tests/reexports-1/b.tsx (/packages/vite/tests/reexports-1/entry.tsx): {"Props", "__global__export__", "__styleThis_reexport_border", "__styleThis_reexport_fromC", "border", "color", "css", "fromC", "getGap", "internal", "late", "renamed", "secondary", "size"}
"use strict";
const __styleThis_reexport_border = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"]["__global__export__"];
const __styleThis_reexport_fromC = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"]["primary"];
const secondary = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"]["secondary"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let internal = "blue";
let size = 4;
function getGap() {
	return `${size}px`;
}
let late = new String("late-j81urw");
late.css = `color: ${color};`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"] ?? {}), "__global__export__": getGap,"border": __styleThis_reexport_border,"fromC": __styleThis_reexport_fromC,"renamed": internal,color,late,secondary};

// /packages/vite/tests/reexports-1/c.ts (/packages/vite/tests/reexports-1/b.tsx): {"__global__export__", "primary"}
"use strict";
let primary = "green";
let __global__export__ = "1px solid";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"] ?? {}), __global__export__,primary};

// /packages/vite/tests/reexports-1/c.ts (/packages/vite/tests/reexports-1/b.tsx): {"secondary"}
"use strict";
let secondary = "purple";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/c.ts"] ?? {}), secondary};

// /packages/vite/tests/reexports-1/entry.tsx: {"Props", "border", "box", "color", "css", "fromC", "getGap", "late", "pad", "renamed", "secondary"}
"use strict";
const Props = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["Props"];
const border = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["border"];
const fromC = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["fromC"];
const secondary = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["secondary"];
const renamed = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["renamed"];
const color = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["color"];
const late = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["late"];
const getGap = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-1/b.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let pad = (props) => props.gap;
let box = new String("box-qnol2j");
box.css = `color: ${color};
  background: ${renamed};
  outline-color: ${secondary};
  border: ${border};
  border-color: ${fromC};
  gap: ${getGap()};
  padding: ${pad({ gap: 2 })}px;

  .${late} {
    margin: 0;
  }`;
return {
"box": box.css
};
