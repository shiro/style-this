// @ts-nocheck
import { css, joinStyles as mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";
import "virtual:style-this:/entry.tsx.css";
// duplicate properties and longhands followed by their shorthand: the last declaration wins in
// atomic mode too. Properties without a prefix aren't atomized, they keep their source order.
const duplicates = "duplicates-hyrgl2";
// shorthands must be emitted before longhands
const shorthands = "shorthands-ijw9ev";
// same declaration => same class as in `shorthands`
const sameDeclaration = "sameDeclaration-bcdq7s";
// `!important` declarations aren't atomized, a layered one would beat the nested override
const important = "important-rc1qzs";
// consecutive declarations of a property are fallbacks, they're kept in order in a single class.
// Declarations without a value are dropped, except for custom properties.
const fallbacks = "fallbacks-v4pm30";
export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);
export { duplicates, shorthands, sameDeclaration, important, fallbacks };
