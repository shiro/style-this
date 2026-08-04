// @ts-nocheck
import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";
import * as _styleThisClasses from "virtual:style-this:/entry.tsx.style-this.js";
import "virtual:style-this:/home/shiro/project/style-this/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = _styleThisClasses._styleThis_var_FancyButton_2 + " custom-button primary";
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
const unrelated = _styleThisClasses._styleThis_unrelated + " test-class";
