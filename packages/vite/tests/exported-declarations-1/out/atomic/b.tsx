// @ts-nocheck
import { css } from "@style-this/core";
import * as _styleThisClasses from "virtual:style-this:./b.tsx.style-this.js";
import "virtual:style-this:/b.tsx.css";
export function getLink() {
	return _styleThisClasses.__styleThis_2;
}
// declared below their uses
function underline(enabled: boolean) {
	return enabled ? "underline" : decoration;
}
const accent = "blue", outline = accent;
export class Theme {
	static accent = _styleThisClasses.__styleThis_1;
}
const decoration = "none";
// `accent` and `borderStyle` move up with it
const border = `1px ${borderStyle} ${accent}`;
const borderStyle = "solid";
