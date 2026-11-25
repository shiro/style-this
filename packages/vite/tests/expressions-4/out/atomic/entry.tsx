// @ts-nocheck
import { css, extraClass, style } from "@style-this/core";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
const dark = true;
// nested `css` templates are class names in the outer template
export const direct = _styleThisClasses.direct;
export const conditional = _styleThisClasses.conditional;
export const arrow = _styleThisClasses.arrow;
export const multiLevel = _styleThisClasses.multiLevel;
const hover = undefined;
export const mixin = _styleThisClasses.mixin;
// function locals are renamed in the nested and `style` templates
function local() {
	const color = "olive";
	const tint = undefined;
	return _styleThisClasses.__styleThis_3;
}
export const fromFunction = local();
function withDefault(className = _styleThisClasses.__styleThis_1) {
	return className;
}
export const fromDefault = withDefault();
