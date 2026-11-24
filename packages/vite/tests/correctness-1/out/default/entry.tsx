// @ts-nocheck
import { css, style } from "@style-this/core";
import mib, * as a from "./a";
import "virtual:style-this:/entry.tsx.css";
// `var`s belong to the function, also the ones in nested blocks
function spaced() {
	if (true) {
		var gap = 2;
	}
	return "__styleThis_14-xq3wdq";
}
function margined() {
	const margin = () => "__styleThis_13-o5mnsl";
	if (true) {
		var gap = 4;
	}
	return margin();
}
// the CSS in the closure is evaluated where it's called, below `gap`
function gapped() {
	const margin = () => "__styleThis_12-qnolav";
	const gap = 3;
	return "__styleThis_11-o96r4h";
}
const spacedOut = "spacedOut-zkhm3g";
// the locals shadow the parameters, also when declared below their use or inside an expression
function Spacer(size, Unit, error) {
	function styles() {
		const double = () => size * 2;
		const size = 4;
		const unit = (() => {
			class Unit {
				static px = "px";
			}
			try {
				throw Unit.px;
			} catch (error) {
				return error;
			}
		})();
		return "__styleThis_10-a381mv";
	}
	return styles();
}
// locals shadowing the top level names used below
const Button = ({ variant }) => {
	const color = variant === "primary" ? "blue" : "gray";
	function mutate() {
		return variant;
	}
	function gap() {
		return 4;
	}
	return [mutate() ?? color, "__styleThis_9-9ubgdi"];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return "__styleThis_8-1i78lu";
		};
		return a3();
	};
	const wi = a2();
	const m = "m-olmb8t";
	return wi;
};
const b = "b-rcdyrk";
const comp = () => {
("foob");
	const b = () => {
		const c = () => "__styleThis_7-ghy34l";
		const s1 = "s1-7o5eb8";
	};
	mutate(b);
	return "__styleThis_6-no9e3s";
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = "s2-ibwxer";
// read themselves, the locals hoisted out of them go below them
class Size {
	static base = 2;
	static gap() {
		const gap = Size.base * 2;
		return "__styleThis_5-stinkp";
	}
}
const spacing = {
	base: 3,
	margin() {
		const margin = spacing.base * 2;
		return "__styleThis_4-zwper0";
	}
};
const sized = "sized-abwhir";
function accent() {
	return "__styleThis_3-9ib41m";
}
// the nested `accent` is included on its own and as part of `theme`, both need its CSS, the
// hoisted one is renamed so it doesn't clash with the top level `accent` and uses `enabled`
function theme() {
	const enabled = true;
	function accent() {
		return enabled ? "__styleThis_2-aj4l6b" : undefined;
	}
	const link = "link-irk5mb";
	return accent();
}
const themed = "themed-gta3sx";
// parameter defaults are transformed like the rest of the function
function card({ padding = "__styleThis_1-q74xyr" } = {}) {
	return padding;
}
const carded = "carded-3ctqjk";
const unrelated = "unrelated-5y7cxe";
