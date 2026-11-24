// {
//   "version": 3,
//   "file": "/packages/vite/tests/atomic-prefixes-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/atomic-prefixes-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, mergeStyles } from \"@style-this/core\";\nimport \"@style-this/core/atomic\";\n\n// duplicate properties are joined into a single class, longhands followed by their shorthand are\n// dropped. Properties without a prefix aren't atomized, they keep their source order.\nconst duplicates = css`\n  --accent: red;\n  padding: 16px;\n  color: red;\n  padding-left: 4px;\n  padding: 8px;\n  -webkit-line-clamp: 2;\n  --accent: blue;\n  border-start-start-radius: 4px;\n`;\n\n// shorthands must be emitted before longhands\nconst shorthands = css`\n  margin: 8px;\n  margin-top: 4px;\n  background: none;\n  background-color: blue;\n  border: 0;\n  border-top: 1px solid red;\n  border-radius: 0;\n`;\n\n// same declaration => same class as in `shorthands`\nconst sameDeclaration = css`\n  margin: 8px;\n`;\n\n// `!important` declarations aren't atomized, a layered one would beat the nested override\nconst important = css`\n  color: red !important;\n  &.active {\n    color: blue !important;\n  }\n`;\n\n// declarations of a property (or its aliases) may be fallbacks, they're kept in order in a single class.\n// Declarations without a value are dropped, except for custom properties.\nconst fallbacks = css`\n  color: blue;\n  display: -webkit-box;\n  width: 100%;\n  width: -webkit-fill-available;\n  display: flex;\n  font-stretch: 75%;\n  font-width: 75%;\n  color: ${\"\"};\n  --empty: ;\n`;\n\nexport const merged = mergeStyles(duplicates, shorthands, sameDeclaration);\n\nexport { duplicates, shorthands, sameDeclaration, important, fallbacks };\n"
//   ],
//   "names": [],
//   "mappings": "AAKmB;;;;;;;;;;AAYA;;;;;;;;;AAWK;;;AAKN;;;;;;AASA"
// }

import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";

// duplicate properties are joined into a single class, longhands followed by their shorthand are
// dropped. Properties without a prefix aren't atomized, they keep their source order.
const duplicates = css`
  --accent: red;
  padding: 16px;
  color: red;
  padding-left: 4px;
  padding: 8px;
  -webkit-line-clamp: 2;
  --accent: blue;
  border-start-start-radius: 4px;
`;

// shorthands must be emitted before longhands
const shorthands = css`
  margin: 8px;
  margin-top: 4px;
  background: none;
  background-color: blue;
  border: 0;
  border-top: 1px solid red;
  border-radius: 0;
`;

// same declaration => same class as in `shorthands`
const sameDeclaration = css`
  margin: 8px;
`;

// `!important` declarations aren't atomized, a layered one would beat the nested override
const important = css`
  color: red !important;
  &.active {
    color: blue !important;
  }
`;

// declarations of a property (or its aliases) may be fallbacks, they're kept in order in a single class.
// Declarations without a value are dropped, except for custom properties.
const fallbacks = css`
  color: blue;
  display: -webkit-box;
  width: 100%;
  width: -webkit-fill-available;
  display: flex;
  font-stretch: 75%;
  font-width: 75%;
  color: ${""};
  --empty: ;
`;

export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);

export { duplicates, shorthands, sameDeclaration, important, fallbacks };
