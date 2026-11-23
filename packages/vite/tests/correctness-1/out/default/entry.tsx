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
	return [mutate() ?? color, "__styleThis_19-rcdyrk"];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return "__styleThis_17-ghy34l";
		};
		return a3();
	};
	const wi = a2();
	const m = "m-7o5eb8";
	return wi;
};
const b = "b-no9e3s";
const comp = () => {
("foob");
	const b = () => {
		const c = () => "__styleThis_12-ibwxer";
		const s1 = "s1-stinkp";
	};
	mutate(b);
	return "__styleThis_9-zwper0";
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = "s2-abwhir";
// read themselves, the locals hoisted out of them go below them
class Size {
	static base = 2;
	static gap() {
		const gap = Size.base * 2;
		return "__styleThis_6-9ib41m";
	}
}
const spacing = {
	base: 3,
	margin() {
		const margin = spacing.base * 2;
		return "__styleThis_4-aj4l6b";
	}
};
const sized = "sized-irk5mb";
// `accent` is included on its own and as part of `theme`, both need its CSS
function theme() {
	function accent() {
		return "__styleThis_2-gta3sx";
	}
	const link = "link-q74xyr";
	return accent();
}
const themed = "themed-3ctqjk";
const unrelated = "unrelated-5y7cxe";
