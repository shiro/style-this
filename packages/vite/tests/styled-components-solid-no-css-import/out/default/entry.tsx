// @ts-nocheck
import { styled } from "@style-this/solid";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-izw5mn";
	let __styleThis__comp = (__styleThis__props) => {
		return <button {...__styleThis__props} class={__styleThis__mergeStyles(FancyButton, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = FancyButton.css;
	__styleThis__comp.toString = () => FancyButton;
	return __styleThis__comp;
})();
