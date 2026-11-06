// /packages/vite/tests/atomic-multiline-1/entry.tsx: {"css", "grid"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let grid = new String("");
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
return {
"grid": grid.css
};
