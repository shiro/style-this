// @ts-nocheck
import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// duplicate properties and longhands followed by their shorthand: the last declaration wins in
// atomic mode too. Properties without a prefix aren't atomized, they keep their source order.
const duplicates = _styleThisClasses.duplicates;
// shorthands must be emitted before longhands
const shorthands = _styleThisClasses.shorthands;
// same declaration => same class as in `shorthands`
const sameDeclaration = _styleThisClasses.sameDeclaration;
// `!important` declarations aren't atomized, a layered one would beat the nested override
const important = _styleThisClasses.important;
export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);
export { duplicates, shorthands, sameDeclaration, important };
