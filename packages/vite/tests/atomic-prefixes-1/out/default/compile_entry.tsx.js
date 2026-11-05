// /packages/vite/tests/atomic-prefixes-1/entry.tsx: {"css", "duplicates", "sameDeclaration", "shorthands"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let duplicates = new String("duplicates-bcdq7s");
duplicates.css = `padding: 16px;
  color: red;
  padding: 8px;
  -webkit-line-clamp: 2;`;
let shorthands = new String("shorthands-rc1qzs");
shorthands.css = `margin-top: 4px;
  margin: 8px;
  background-color: blue;
  background: none;
  border-top: 1px solid red;
  border: 0;`;
let sameDeclaration = new String("sameDeclaration-v4pm30");
sameDeclaration.css = `margin: 8px;`;
const cssSourcemapData = [{className:'duplicates-bcdq7s',start:177,end:255},{className:'shorthands-rc1qzs',start:324,end:452},{className:'sameDeclaration-v4pm30',start:532,end:553}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/atomic-prefixes-1/entry.tsx.css').resolve([
`.duplicates-bcdq7s {
${duplicates.css}
}`,
`.shorthands-rc1qzs {
${shorthands.css}
}`,
`.sameDeclaration-v4pm30 {
${sameDeclaration.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-prefixes-1/entry.tsx.css');
