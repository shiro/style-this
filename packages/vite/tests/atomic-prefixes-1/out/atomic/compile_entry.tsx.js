// /packages/vite/tests/atomic-prefixes-1/entry.tsx: {"css", "duplicates", "sameDeclaration", "shorthands"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let duplicates = new String("");
duplicates.css = `padding: 16px;
  color: red;
  padding: 8px;
  -webkit-line-clamp: 2;`;
let shorthands = new String("");
shorthands.css = `margin-top: 4px;
  margin: 8px;
  background-color: blue;
  background: none;
  border-top: 1px solid red;
  border: 0;`;
let sameDeclaration = new String("");
sameDeclaration.css = `margin: 8px;`;
return {
"duplicates": duplicates.css,
"shorthands": shorthands.css,
"sameDeclaration": sameDeclaration.css
};
