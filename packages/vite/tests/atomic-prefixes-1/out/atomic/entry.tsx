// @ts-nocheck
import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// duplicate properties are joined into a single class, longhands followed by their shorthand are
// dropped. Properties without a prefix aren't atomized, they keep their source order.
const duplicates = _styleThisClasses.duplicates;
// shorthands must be emitted before longhands
const shorthands = _styleThisClasses.shorthands;
// same declaration => same class as in `shorthands`
const sameDeclaration = _styleThisClasses.sameDeclaration;
// `!important` declarations aren't atomized, a layered one would beat the nested override
const important = _styleThisClasses.important;
// declarations of a property (or its aliases) may be fallbacks, they're kept in order in a single class.
// Declarations without a value are dropped, except for custom properties.
const fallbacks = _styleThisClasses.fallbacks;
export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);
export { duplicates, shorthands, sameDeclaration, important, fallbacks };
