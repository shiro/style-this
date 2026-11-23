// @ts-nocheck
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
const scale = 2;
// imports after other statements
import { css } from "@style-this/core";
import "@style-this/core/atomic";
import { primary, secondary, own, palette, tokens } from "./b";
import * as sizes from "./sizes";
// the namespace is used as a whole
const total = (values: Record<string, number>) => Object.values(values).reduce((a, b) => a + b);
export const box = _styleThisClasses.box;
