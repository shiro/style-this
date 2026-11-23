// @ts-nocheck
import { css, style } from "@style-this/core";
import mib, * as a from "./a";
import "virtual:style-this:/entry.tsx.css";
// locals shadowing the top level names used below
const Button = ({ variant }) => {
	const color = variant === "primary" ? "blue" : "gray";
	function mutate() {
		return variant;
	}
	function gap() {
		return 4;
	}
	return [mutate() ?? color, "__styleThis_17-no9e3s"];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return "__styleThis_15-ibwxer";
		};
		return a3();
	};
	const wi = a2();
	const m = "m-stinkp";
	return wi;
};
const b = "b-zwper0";
const comp = () => {
("foob");
	const b = () => {
		const c = () => "__styleThis_10-abwhir";
		const s1 = "s1-9ib41m";
	};
	mutate(b);
	return "__styleThis_7-aj4l6b";
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = "s2-irk5mb";
// read themselves, the locals hoisted out of them go below them
class Size {
	static base = 2;
	static gap() {
		const gap = Size.base * 2;
		return "__styleThis_4-gta3sx";
	}
}
const spacing = {
	base: 3,
	margin() {
		const margin = spacing.base * 2;
		return "__styleThis_2-q74xyr";
	}
};
const sized = "sized-3ctqjk";
const unrelated = "unrelated-5y7cxe";
