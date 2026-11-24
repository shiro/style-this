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
