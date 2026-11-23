// /packages/vite/tests/atomic-prefixes-1/entry.tsx: {"css", "duplicates", "fallbacks", "important", "sameDeclaration", "shorthands"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let duplicates = new String("duplicates-hyrgl2");
duplicates.css = `--accent: red;
  padding: 16px;
  color: red;
  padding-left: 4px;
  padding: 8px;
  -webkit-line-clamp: 2;
  --accent: blue;`;
let shorthands = new String("shorthands-ijw9ev");
shorthands.css = `margin: 8px;
  margin-top: 4px;
  background: none;
  background-color: blue;
  border: 0;
  border-top: 1px solid red;`;
let sameDeclaration = new String("sameDeclaration-bcdq7s");
sameDeclaration.css = `margin: 8px;`;
let important = new String("important-rc1qzs");
important.css = `color: red !important;
  &.active {
    color: blue !important;
  }`;
let fallbacks = new String("fallbacks-v4pm30");
fallbacks.css = `color: blue;
  display: -webkit-box;
  display: flex;
  width: 100%;
  width: -webkit-fill-available;
  color: ${""};
  --empty: ;`;
return {
"duplicates": duplicates.css,
"shorthands": shorthands.css,
"sameDeclaration": sameDeclaration.css,
"important": important.css,
"fallbacks": fallbacks.css
};
