// /packages/vite/tests/ignored-imports-1/entry.tsx: {"accent", "button", "css", "getColor", "open", "store", "trackEvent"}
"use strict";
const accent = __styleThis_value_cache_ggghhhii["/packages/vite/tests/ignored-imports-1/lib.ts"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let getColor = (onClick) => onClick ? (trackEvent(store), open()) : accent;
let button = new String("button-glmn01");
button.css = `color: ${getColor()};`;
return {
"button": button.css
};


// /packages/vite/tests/ignored-imports-1/lib.ts (/packages/vite/tests/ignored-imports-1/entry.tsx): {"color"}
"use strict";
let color = "red";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/ignored-imports-1/lib.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/ignored-imports-1/lib.ts"] ?? {}), color};