// /packages/vite/tests/atomic-prefixes-1/entry.tsx: {"css", "duplicates", "sameDeclaration", "shorthands"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let duplicates = new String("duplicates-bcdq7s");
duplicates.css = `padding: 16px;
  color: red;
  padding-left: 4px;
  padding: 8px;
  -webkit-line-clamp: 2;`;
let shorthands = new String("shorthands-rc1qzs");
shorthands.css = `margin: 8px;
  margin-top: 4px;
  background: none;
  background-color: blue;
  border: 0;
  border-top: 1px solid red;`;
let sameDeclaration = new String("sameDeclaration-v4pm30");
sameDeclaration.css = `margin: 8px;`;
return [
`.duplicates-bcdq7s {
${duplicates.css}
}`,
`.shorthands-rc1qzs {
${shorthands.css}
}`,
`.sameDeclaration-v4pm30 {
${sameDeclaration.css}
}`
].join('\n');
