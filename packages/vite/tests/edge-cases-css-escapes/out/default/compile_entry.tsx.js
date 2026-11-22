// /packages/vite/tests/edge-cases-css-escapes/entry.tsx: {"css", "dash", "icon", "iconFont", "shared", "style"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let icon = "\\f101";
let shared = `content: "\\f102";`;
let dash = new String("dash-b4tmnk");
dash.css = `&::before {
    content: "\\2014 \\\` \\\${icon}";
  }`;
let iconFont = new String("iconFont-234xiz");
iconFont.css = `${shared}
  &::after {
    content: "\\f101 ${icon}";
  }`;
return [
`.dash-b4tmnk {
${dash.css}
}`,
`.iconFont-234xiz {
${iconFont.css}
}`
].join('\n');
