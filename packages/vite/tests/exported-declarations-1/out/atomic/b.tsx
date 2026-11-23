// @ts-nocheck
import { css } from "@style-this/core";
import * as _styleThisClasses from "virtual:style-this:./b.tsx.style-this.js";
import "virtual:style-this:/b.tsx.css";
export function getLink() {
	return _styleThisClasses.__styleThis_4;
}
// declared below their uses
function underline(enabled: boolean) {
	return enabled ? "underline" : decoration;
}
// its CSS moves up with it
function focus() {
	return _styleThisClasses.__styleThis_3;
}
const accent = "blue", outline = accent;
export class Theme {
	static accent = _styleThisClasses.__styleThis_2;
}
const decoration = "none";
// `accent` and `borderStyle` move up with it
const border = `1px ${borderStyle} ${accent}`;
const borderStyle = "solid";
// destructured into a temporary when the importer evaluates it, which doesn't change the class
// names above
export const { weight } = { weight: "bold" };
// references itself under its local name
export default class Palette {
	static primary = "teal";
	static accent = _styleThisClasses.__styleThis_1;
}
