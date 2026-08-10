// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"css", "innerStyle", "outerStyle"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let innerStyle = new String("innerStyle-oty7sd");
innerStyle.css = `background: red;
  padding: 10px;`;
let outerStyle = new String("outerStyle-mvwhqz");
outerStyle.css = `width: 100%;
  .${innerStyle} {
    background: coral;
  }
  @media (max-width: 500px) {
    .${innerStyle} {
      background: blue;
    }
  }`;
const cssSourcemapData = [{className:'innerStyle-oty7sd',start:130,end:172},{className:'outerStyle-mvwhqz',start:308,end:460}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.css').resolve([
`.innerStyle-oty7sd {
${innerStyle.css}
}`,
`.outerStyle-mvwhqz {
${outerStyle.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-media-query-1/entry.tsx.css');
