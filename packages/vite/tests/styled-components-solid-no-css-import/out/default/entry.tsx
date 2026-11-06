// @ts-nocheck
import { styled } from "@style-this/solid";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-izw5mn";
	let comp = (props) => {
		return <button {...props} class={__styleThis__mergeStyles(FancyButton, props.class)} />;
	};
	comp.css = FancyButton.css;
	comp.toString = () => FancyButton;
	return comp;
})();
