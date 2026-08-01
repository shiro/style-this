// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-t6j09m";
	let comp = (props) => <button {...props} className={FancyButton + (" " + (props.className ?? ""))} style={{
		"--var1-2nwhuj": (({ a }) => a)({
			...props.styleProps,
			"props": props
		}),
		...props.style ?? {}
	}} />;
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-2rc96v";
