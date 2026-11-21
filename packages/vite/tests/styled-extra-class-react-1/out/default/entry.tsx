// @ts-nocheck
import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-bsxab0 custom-button primary";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style,...__styleThis__rest } = __styleThis__props;
		return <button {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(FancyButton, __styleThis__rest.className)} style={{
			"--var1-30dyns": (({ a }) => a)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			...__styleThis__props.style ?? {}
		}} />;
	});
	__styleThis__comp.toString = () => FancyButton;
	return __styleThis__comp;
})();
const unrelated = "unrelated-l2rcte test-class";
