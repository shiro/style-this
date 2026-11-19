// @ts-nocheck
import { css } from "@style-this/core";
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
	const button = "button-st6jwl";
	return button;
}
