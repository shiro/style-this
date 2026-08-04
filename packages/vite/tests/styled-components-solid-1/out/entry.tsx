// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-3slijs";
	let comp = (props) => <button {...props} class={props.class ? FancyButton + (" " + props.class) : FancyButton} style={{
		"--var1-c5iro5": (({ a }) => a)({
			...props.styleProps,
			"props": props
		}),
		...props.style ?? {}
	}} />;
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-96jgdy";
