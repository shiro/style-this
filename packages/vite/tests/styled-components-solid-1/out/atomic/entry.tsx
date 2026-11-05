// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = _styleThisClasses.__styleThis_var_FancyButton_2;
	let comp = (props) => {
		const [_, rest] = __styleThis__splitProps(props, ["styleProps", "style"]);
		return <button {...rest} class={__styleThis__mergeStyles(FancyButton, props.class)} style={{
			"--var1-q3ctyv": (({ a }) => a)({
				...props.styleProps,
				"props": props
			}),
			...props.style ?? {}
		}} />;
	};
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = _styleThisClasses.unrelated;
