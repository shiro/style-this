import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";

// duplicate properties and longhands followed by their shorthand: the last declaration wins in
// atomic mode too. Properties without a prefix aren't atomized, they keep their source order.
const duplicates = css`
  --accent: red;
  padding: 16px;
  color: red;
  padding-left: 4px;
  padding: 8px;
  -webkit-line-clamp: 2;
  --accent: blue;
`;

// shorthands must be emitted before longhands
const shorthands = css`
  margin: 8px;
  margin-top: 4px;
  background: none;
  background-color: blue;
  border: 0;
  border-top: 1px solid red;
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

// consecutive declarations of a property are fallbacks, they're kept in order in a single class.
// Declarations without a value are dropped, except for custom properties.
const fallbacks = css`
  color: blue;
  display: -webkit-box;
  display: flex;
  width: 100%;
  width: -webkit-fill-available;
  color: ${""};
  --empty: ;
`;

export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);

export { duplicates, shorthands, sameDeclaration, important, fallbacks };
