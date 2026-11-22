// /packages/vite/tests/atomic-prefixes-1/entry.tsx: {"css", "duplicates", "important", "sameDeclaration", "shorthands"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let duplicates = new String("duplicates-ijw9ev");
duplicates.css = `padding: 16px;
  color: red;
  padding-left: 4px;
  padding: 8px;
  -webkit-line-clamp: 2;`;
let shorthands = new String("shorthands-bcdq7s");
shorthands.css = `margin: 8px;
  margin-top: 4px;
  background: none;
  background-color: blue;
  border: 0;
  border-top: 1px solid red;`;
let sameDeclaration = new String("sameDeclaration-rc1qzs");
sameDeclaration.css = `margin: 8px;`;
let important = new String("important-v4pm30");
important.css = `color: red !important;
  &.active {
    color: blue !important;
  }`;
return {
"duplicates": duplicates.css,
"shorthands": shorthands.css,
"sameDeclaration": sameDeclaration.css,
"important": important.css
};
