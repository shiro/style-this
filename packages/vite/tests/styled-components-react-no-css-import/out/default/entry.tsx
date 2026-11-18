// @ts-nocheck
import { styled } from "@style-this/react";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-yb0pqr";
	let comp = __styleThis__forwardRef((props, ref) => <button {...props} ref={ref} className={__styleThis__mergeStyles(FancyButton, props.className)} />);
	comp.css = FancyButton.css;
	comp.toString = () => FancyButton;
	return comp;
})();
