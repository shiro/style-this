// @ts-nocheck
import { css, mergeStyles } from "@style-this/core";
import "virtual:style-this:__atomic_entrypoint.css";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// duplicate properties: the last declaration wins in atomic mode too
const duplicates = _styleThisClasses.duplicates;
// shorthands must be emitted before longhands
const shorthands = _styleThisClasses.shorthands;
// same declaration => same class as in `shorthands`
const sameDeclaration = _styleThisClasses.sameDeclaration;
export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);
export { duplicates, shorthands, sameDeclaration };
