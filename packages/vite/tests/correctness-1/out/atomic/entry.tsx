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
	return [mutate() ?? color, _styleThisClasses.__styleThis_13];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return _styleThisClasses.__styleThis_11;
		};
		return a3();
	};
	const wi = a2();
	const m = _styleThisClasses.__styleThis_var_m_7;
	return wi;
};
const b = _styleThisClasses.b;
const comp = () => {
("foob");
	const b = () => {
		const c = () => _styleThisClasses.__styleThis_6;
		const s1 = _styleThisClasses.__styleThis_var_s1_4;
	};
	mutate(b);
	return _styleThisClasses.__styleThis_3;
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = _styleThisClasses.s2;
const unrelated = _styleThisClasses.unrelated;
