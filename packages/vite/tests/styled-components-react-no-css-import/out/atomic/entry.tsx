// @ts-nocheck
import { styled } from "@style-this/react";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = _styleThisClasses.__styleThis_var_FancyButton_2;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <button {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(FancyButton, __styleThis__props.className)} />);
	__styleThis__comp.css = FancyButton.css;
	__styleThis__comp.toString = () => FancyButton;
	return __styleThis__comp;
})();
