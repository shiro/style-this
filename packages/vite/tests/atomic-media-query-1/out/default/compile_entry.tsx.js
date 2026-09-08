// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"css", "innerStyle", "outerStyle"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let innerStyle = new String("innerStyle-2zo1az");
innerStyle.css = `background: red;
  padding: 10px;`;
let outerStyle = new String("outerStyle-z41ifw");
outerStyle.css = `width: 100%;
  .${innerStyle} {
    background: coral;
  }
  @media (max-width: 500px) {
    .${innerStyle} {
      background: blue;
    }
  }`;
const cssSourcemapData = [{className:'innerStyle-2zo1az',start:130,end:172},{className:'outerStyle-z41ifw',start:308,end:460}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.css').resolve([
`.innerStyle-2zo1az {
${innerStyle.css}
}`,
`.outerStyle-z41ifw {
${outerStyle.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-media-query-1/entry.tsx.css');
