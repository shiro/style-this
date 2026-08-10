// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"css", "innerStyle", "outerStyle"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let innerStyle = new String("");
innerStyle.css = `background: red;
  padding: 10px;`;
let outerStyle = new String("");
outerStyle.css = `width: 100%;
  .${innerStyle} {
    background: coral;
  }
  @media (max-width: 500px) {
    .${innerStyle} {
      background: blue;
    }
  }`;
return {
"innerStyle": innerStyle.css,
"outerStyle": outerStyle.css
};
