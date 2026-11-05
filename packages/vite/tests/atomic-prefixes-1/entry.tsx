import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";

// duplicate properties: the last declaration wins in atomic mode too
const duplicates = css`
  padding: 16px;
  color: red;
  padding: 8px;
  -webkit-line-clamp: 2;
`;

// shorthands must be emitted before longhands
const shorthands = css`
  margin-top: 4px;
  margin: 8px;
  background-color: blue;
  background: none;
  border-top: 1px solid red;
  border: 0;
`;

// same declaration => same class as in `shorthands`
const sameDeclaration = css`
  margin: 8px;
`;

export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);

export { duplicates, shorthands, sameDeclaration };
