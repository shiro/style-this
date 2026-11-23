// @ts-nocheck
import { css, style } from "@style-this/core";
import mib, * as a from "./a";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
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
	return [mutate() ?? color, _styleThisClasses.__styleThis_19];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return _styleThisClasses.__styleThis_17;
		};
		return a3();
	};
	const wi = a2();
	const m = _styleThisClasses.__styleThis_var_m_13;
	return wi;
};
const b = _styleThisClasses.b;
const comp = () => {
("foob");
	const b = () => {
		const c = () => _styleThisClasses.__styleThis_12;
		const s1 = _styleThisClasses.__styleThis_var_s1_10;
	};
	mutate(b);
	return _styleThisClasses.__styleThis_9;
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = _styleThisClasses.s2;
// read themselves, the locals hoisted out of them go below them
class Size {
	static base = 2;
	static gap() {
		const gap = Size.base * 2;
		return _styleThisClasses.__styleThis_6;
	}
}
const spacing = {
	base: 3,
	margin() {
		const margin = spacing.base * 2;
		return _styleThisClasses.__styleThis_4;
	}
};
const sized = _styleThisClasses.sized;
// `accent` is included on its own and as part of `theme`, both need its CSS
function theme() {
	function accent() {
		return _styleThisClasses.__styleThis_2;
	}
	const link = _styleThisClasses.__styleThis_var_link_1;
	return accent();
}
const themed = _styleThisClasses.themed;
const unrelated = _styleThisClasses.unrelated;
