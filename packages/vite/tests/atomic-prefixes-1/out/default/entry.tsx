// @ts-nocheck
import { css, joinStyles as mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";
import "virtual:style-this:/entry.tsx.css";
// duplicate properties and longhands followed by their shorthand: the last declaration wins in
// atomic mode too. Properties without a prefix aren't atomized, they keep their source order.
const duplicates = "duplicates-ijw9ev";
// shorthands must be emitted before longhands
const shorthands = "shorthands-bcdq7s";
// same declaration => same class as in `shorthands`
const sameDeclaration = "sameDeclaration-rc1qzs";
// `!important` declarations aren't atomized, a layered one would beat the nested override
const important = "important-v4pm30";
export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);
export { duplicates, shorthands, sameDeclaration, important };
