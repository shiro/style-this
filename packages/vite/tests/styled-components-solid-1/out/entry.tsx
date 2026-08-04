// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-mr0hyf";
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
const unrelated = "unrelated-o9y7wh";
