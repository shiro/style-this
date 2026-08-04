// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import * as _styleThisClasses from "virtual:style-this:/entry.tsx.style-this.js";
import "virtual:style-this:/home/shiro/project/style-this/packages/vite/tests/styled-components-solid-1/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = _styleThisClasses._styleThis_var_FancyButton_2;
	let comp = (props) => {
		const [_, rest] = __styleThis__splitProps(props, ["styleProps", "style"]);
		return <button {...rest} class={props.class ? FancyButton + (" " + props.class) : FancyButton} style={{
			"--var1-c5iro5": (({ a }) => a)({
				...props.styleProps,
				"props": props
			}),
			...props.style ?? {}
		}} />;
	};
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = _styleThisClasses._styleThis_unrelated;
