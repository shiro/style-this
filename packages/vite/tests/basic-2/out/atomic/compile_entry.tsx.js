// /packages/vite/tests/basic-2/entry.tsx: {"a", "b", "css", "foo"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-j0523w");
a.css = `background: ${foo};`;
let b = new String("b-w5irkh");
b.css = `background: ${foo};`;
return {
"a": a.css,
"b": b.css
};
