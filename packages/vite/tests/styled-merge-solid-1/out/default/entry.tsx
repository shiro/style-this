// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import "virtual:style-this:/entry.tsx.css";
export const Base = (() => {
	let Base = "Base-fw9e3s";
	let __styleThis__comp = (__styleThis__props) => {
		return <button {...__styleThis__props} class={__styleThis__mergeStyles(Base, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = Base.css;
	__styleThis__comp.toString = () => Base;
	return __styleThis__comp;
})();
// overrides Base's padding, Base merges this component's classes last
export const Extended = (() => {
	let Extended = "Extended-bs963c";
	let __styleThis__comp = (__styleThis__props) => {
		return <Base {...__styleThis__props} class={__styleThis__mergeStyles(Extended, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = Extended.css;
	__styleThis__comp.toString = () => Extended;
	return __styleThis__comp;
})();
export const override = "override-k1mzgd";
export const App = () => <Extended class={override}>hi</Extended>;
