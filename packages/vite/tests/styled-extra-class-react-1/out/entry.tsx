// @ts-nocheck
import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-bsxab0 custom-button primary";
	let comp = (props) => {
		const { styleProps: _styleProps, style: _style,...rest } = props;
		return <button {...rest} className={rest.className ? FancyButton + (" " + rest.className) : FancyButton} style={{
			"--var1-vklyb0": (({ a }) => a)({
				...props.styleProps,
				"props": props
			}),
			...props.style ?? {}
		}} />;
	};
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-l2rcte test-class";
