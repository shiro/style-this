// /packages/vite/tests/basic-2/entry.tsx: {"a", "b", "css", "foo"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("");
a.css = `background: ${foo};`;
let b = new String("");
b.css = `background: ${foo};`;
return {
"a": a.css,
"b": b.css
};
