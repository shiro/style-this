// @ts-nocheck
import { css, joinStyles as mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";
import "virtual:style-this:/entry.tsx.css";
// duplicate properties: the last declaration wins in atomic mode too
const duplicates = "duplicates-bcdq7s";
// shorthands must be emitted before longhands
const shorthands = "shorthands-rc1qzs";
// same declaration => same class as in `shorthands`
const sameDeclaration = "sameDeclaration-v4pm30";
export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);
export { duplicates, shorthands, sameDeclaration };
