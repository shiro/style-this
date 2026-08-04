// @ts-nocheck
import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-3gdav0 custom-button primary";
	let comp = (props) => <button {...props} className={props.className ? FancyButton + (" " + props.className) : FancyButton} style={{
		"--var1-vklyb0": (({ a }) => a)({
			...props.styleProps,
			"props": props
		}),
		...props.style ?? {}
	}} />;
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-l2f4xi test-class";
