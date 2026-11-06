// /packages/vite/tests/basic-1/entry.tsx: {"a", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-xezolq");
a.css = `background: red;`;
return {
"a": a.css
};
