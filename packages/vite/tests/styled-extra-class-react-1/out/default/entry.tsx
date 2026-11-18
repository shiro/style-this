// @ts-nocheck
import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-bsxab0 custom-button primary";
	let comp = __styleThis__forwardRef((props, ref) => {
		const { styleProps: _styleProps, style: _style,...rest } = props;
		return <button {...rest} ref={ref} className={__styleThis__mergeStyles(FancyButton, rest.className)} style={{
			"--var1-30dyns": (({ a }) => a)({
				...props.styleProps,
				"props": props
			}),
			...props.style ?? {}
		}} />;
	});
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-l2rcte test-class";
