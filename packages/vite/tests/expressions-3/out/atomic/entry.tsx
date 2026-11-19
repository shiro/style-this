// @ts-nocheck
import { css } from "@style-this/core";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export function Button() {
	const color = "red";
	const size = 4;
	const theme = {
		color: "blue",
		size: 8
	};
	const shorthand = {
		color,
		size
	};
	const methods = { color() {
		return "green";
	} };
	const pick = ({ color }: {
		color: string;
	}) => color;
	const { size: padding } = theme;
	const button = _styleThisClasses.__styleThis_var_button_1;
	return button;
}
