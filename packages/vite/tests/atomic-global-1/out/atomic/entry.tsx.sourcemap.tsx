// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/atomic-global-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/atomic-global-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport \"@style-this/core/atomic\";\n\n// Regular style\nconst mainStyle = css`\n  background: red;\n  padding: 20px;\n`;\n\n// Global style with _Global prefix\nconst _GlobalMain = css`\n  .Global__Main {\n    background: coral;\n    margin: 10px;\n  }\n  \n  @media (max-width: 600px) {\n    .Global__Main {\n      background: blue;\n    }\n  }\n`;\n\nexport { mainStyle, _GlobalMain };\n"
//   ],
//   "names": [],
//   "mappings": "AAIkB"
// }

import { css } from "@style-this/core";
import "@style-this/core/atomic";

// Regular style
const mainStyle = css`
  background: red;
  padding: 20px;
`;

// Global style with _Global prefix
const _GlobalMain = css`
  .Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }
`;

export { mainStyle, _GlobalMain };
