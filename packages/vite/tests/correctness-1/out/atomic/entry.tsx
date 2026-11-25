// @ts-nocheck
import { css, style } from "@style-this/core";
import mib, * as a from "./a";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// `var`s belong to the function, also the ones in nested blocks
function spaced() {
	if (true) {
		var gap = 2;
	}
	return _styleThisClasses.__styleThis_18;
}
function margined() {
	const margin = () => _styleThisClasses.__styleThis_17;
	if (true) {
		var gap = 4;
	}
	return margin();
}
// the CSS in the closure is evaluated where it's called, below `gap`
function gapped() {
	const margin = () => _styleThisClasses.__styleThis_16;
	const gap = 3;
	return _styleThisClasses.__styleThis_15;
}
// `var`s can be redeclared, also in nested blocks
function redeclared() {
	var gap = 5;
	if (true) {
		var gap = 6;
	}
	return _styleThisClasses.__styleThis_14;
}
const spacedOut = _styleThisClasses.spacedOut;
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
		return _styleThisClasses.__styleThis_13;
	}
	return styles();
}
// the names of function and class expressions are only declared inside them
function Counter(count, Count) {
	const countdown = function count(n) {
		return n > 1 ? count(n - 1) : n;
	};
	const Doubled = class Count {
		static size = 2;
		static double() {
			return Count.size * 2;
		}
	};
	return _styleThisClasses.__styleThis_12;
}
// also for the CSS inside them, not the outer names
const fib = 1;
const Inner = 1;
const fibbed = function fib() {
	return _styleThisClasses.__styleThis_11;
};
const Sized = class Inner {
	static size = 3;
	static height = _styleThisClasses.__styleThis_10;
};
const named = _styleThisClasses.named;
// locals shadowing the top level names used below
const Button = ({ variant }) => {
	const color = variant === "primary" ? "blue" : "gray";
	function mutate() {
		return variant;
	}
	function gap() {
		return 4;
	}
	return [mutate() ?? color, _styleThisClasses.__styleThis_9];
};
const mutate = (v) => v;
const a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return _styleThisClasses.__styleThis_8;
		};
		return a3();
	};
	const wi = a2();
	const m = _styleThisClasses.__styleThis_var_m_10;
	return wi;
};
const b = _styleThisClasses.b;
const comp = () => {
("foob");
	const b = () => {
		const c = () => _styleThisClasses.__styleThis_7;
		const s1 = _styleThisClasses.__styleThis_var_s1_8;
	};
	mutate(b);
	return _styleThisClasses.__styleThis_6;
};
const { color } = { color: "blue" };
const st = undefined;
const s2 = _styleThisClasses.s2;
// read themselves, the locals hoisted out of them go below them
class Size {
	static base = 2;
	static gap() {
		const gap = Size.base * 2;
		return _styleThisClasses.__styleThis_5;
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
function accent() {
	return _styleThisClasses.__styleThis_3;
}
// the nested `accent` is included on its own and as part of `theme`, both need its CSS, the
// hoisted one is renamed so it doesn't clash with the top level `accent` and uses `enabled`
function theme() {
	const enabled = true;
	function accent() {
		return enabled ? _styleThisClasses.__styleThis_2 : undefined;
	}
	const link = _styleThisClasses.__styleThis_var_link_1;
	return accent();
}
const themed = _styleThisClasses.themed;
// parameter defaults are transformed like the rest of the function
function card({ padding = _styleThisClasses.__styleThis_1 } = {}) {
	return padding;
}
const carded = _styleThisClasses.carded;
const unrelated = _styleThisClasses.unrelated;
