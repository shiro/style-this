// @ts-nocheck
import { css } from "@style-this/core";
import "virtual:style-this:/b.tsx.css";
export function getLink() {
	return "__styleThis_4-fkp63g";
}
// declared below their uses
function underline(enabled: boolean) {
	return enabled ? "underline" : decoration;
}
// its CSS moves up with it
function focus() {
	return "__styleThis_3-7styr4";
}
const accent = "blue", outline = accent;
export class Theme {
	static accent = "__styleThis_2-9erkd2";
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
	static accent = "__styleThis_1-hi3g5a";
}
