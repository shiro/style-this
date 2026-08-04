// /packages/vite/tests/atomic-global-1/entry.tsx: {"css", "mainStyle", "_GlobalMain"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let mainStyle = new String("mainStyle-74hqzc");
mainStyle.css = `background: red;
  padding: 20px;`;
let _GlobalMain = new String("_GlobalMain");
_GlobalMain.css = `.Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }`;
const cssSourcemapData = [{className:'mainStyle-74hqzc',start:110,end:152},{className:'_GlobalMain',start:211,end:367}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-global-1/entry.tsx.css').resolve([
`.mainStyle-74hqzc {
${mainStyle.css}
}`,
`${_GlobalMain.css}
`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-global-1/entry.tsx.css');


// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"innerStyle", "outerStyle", "css"}
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


// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-xezolq");
a.css = `background: red;`;
const cssSourcemapData = [{className:'a-xezolq',start:51,end:76}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-xezolq {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');


// /packages/vite/tests/basic-2/entry.tsx: {"css", "a", "foo", "b"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-j0523w");
a.css = `background: ${foo};`;
let b = new String("b-w5irkh");
b.css = `background: ${foo};`;
const cssSourcemapData = [{className:'a-j0523w',start:70,end:98},{className:'b-w5irkh',start:110,end:138}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.css').resolve([
`.a-j0523w {
${a.css}
}`,
`.b-w5irkh {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-2/entry.tsx.css');
