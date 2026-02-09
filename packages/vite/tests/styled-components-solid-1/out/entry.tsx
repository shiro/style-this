import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-mr0hyf";
	let comp = (props) => <button {...props} class={FancyButton + (" " + (props.class ?? ""))} style={{
		"--var1-c5iro5": (({ a }) => a)(props.styleProps),
		...props.style ?? {}
	}} />;
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-o9y7wh";
