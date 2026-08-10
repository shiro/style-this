// /packages/vite/tests/extra-class-1/entry.tsx: {"a", "b", "css", "extraClass"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("");
a.css = `background: red;
  `;
let b = new String("");
b.css = `color: blue;
  `;
return {
"a": a.css,
"b": b.css
};
