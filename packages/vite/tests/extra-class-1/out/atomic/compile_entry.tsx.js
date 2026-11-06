// /packages/vite/tests/extra-class-1/entry.tsx: {"a", "b", "css", "extraClass"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-4tu7c1 bar foo");
a.css = `background: red;
  `;
let b = new String("b-9mz4di baz");
b.css = `color: blue;
  `;
return {
"a": a.css,
"b": b.css
};
