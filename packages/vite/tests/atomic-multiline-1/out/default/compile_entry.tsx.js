// /packages/vite/tests/atomic-multiline-1/entry.tsx: {"css", "grid"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let grid = new String("grid-1ajg1y");
grid.css = `display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto;
  transition:
    color 0.2s,
    background 0.2s;
  &:hover {
    color: blue;
  }`;
const cssSourcemapData = [{className:'grid-1ajg1y',start:95,end:256}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/atomic-multiline-1/entry.tsx.css').resolve([
`.grid-1ajg1y {
${grid.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-multiline-1/entry.tsx.css');
