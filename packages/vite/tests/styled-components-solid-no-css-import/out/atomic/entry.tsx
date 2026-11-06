// @ts-nocheck
import { styled } from "@style-this/solid";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = _styleThisClasses.__styleThis_var_FancyButton_2;
	let comp = (props) => {
		return <button {...props} class={__styleThis__mergeStyles(FancyButton, props.class)} />;
	};
	comp.css = FancyButton.css;
	comp.toString = () => FancyButton;
	return comp;
})();
