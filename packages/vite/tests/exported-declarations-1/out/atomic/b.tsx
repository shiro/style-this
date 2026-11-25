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
// compiled to JS with the rest
export namespace Sizes {
	export const gap = "2px";
	// members keep their name, even if the outer one is renamed
	export namespace Inner {
		export const gap = "3px";
	}
	// hoisted with the template
import Nested = Inner;
	export const card = _styleThisClasses.__styleThis_var_card_2;
}
export enum Weight {
	Bold = "bold"
}
// merged, each declaration reads it from the value cache
export function Badge() {
	return "badge";
}
export namespace Badge {
	export const color = "olive";
}
// aliases, like `const`
import Inner = Sizes.Inner;
export import InnerSizes = Sizes.Inner;
import InnerType = Sizes.Inner;
const grid = _styleThisClasses.grid;
// references itself under its local name
export default class Palette {
	static primary = "teal";
	static accent = _styleThisClasses.__styleThis_1;
}
