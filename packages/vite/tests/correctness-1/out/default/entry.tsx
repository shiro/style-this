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
	return [mutate() ?? color, "__styleThis_8-olmb8t"];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return "__styleThis_7-rcdyrk";
		};
		return a3();
	};
	const wi = a2();
	const m = "m-ghy34l";
	return wi;
};
const b = "b-7o5eb8";
const comp = () => {
("foob");
	const b = () => {
		const c = () => "__styleThis_6-no9e3s";
		const s1 = "s1-ibwxer";
	};
	mutate(b);
	return "__styleThis_5-stinkp";
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = "s2-zwper0";
// read themselves, the locals hoisted out of them go below them
class Size {
	static base = 2;
	static gap() {
		const gap = Size.base * 2;
		return "__styleThis_4-abwhir";
	}
}
const spacing = {
	base: 3,
	margin() {
		const margin = spacing.base * 2;
		return "__styleThis_3-9ib41m";
	}
};
const sized = "sized-aj4l6b";
function accent() {
	return "__styleThis_2-irk5mb";
}
// the nested `accent` is included on its own and as part of `theme`, both need its CSS, the
// hoisted one is renamed so it doesn't clash with the top level `accent` and uses `enabled`
function theme() {
	const enabled = true;
	function accent() {
		return enabled ? "__styleThis_1-gta3sx" : undefined;
	}
	const link = "link-q74xyr";
	return accent();
}
const themed = "themed-3ctqjk";
const unrelated = "unrelated-5y7cxe";
