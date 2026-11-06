// /packages/vite/tests/expressions-2/entry.tsx: {"a", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-7ohiv8");
a.css = `margin: ${() => 99}px;`;
return {
"a": a.css
};
