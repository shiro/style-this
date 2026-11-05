// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import "virtual:style-this:/entry.tsx.css";
export const Base = (() => {
	let Base = "Base-fw9e3s";
	let comp = (props) => {
		return <button {...props} class={__styleThis__mergeStyles(Base, props.class)} />;
	};
	comp.css = Base.css;
	comp.toString = () => Base;
	return comp;
})();
// overrides Base's padding, Base merges this component's classes last
export const Extended = (() => {
	let Extended = "Extended-bs963c";
	let comp = (props) => {
		return <Base {...props} class={__styleThis__mergeStyles(Extended, props.class)} />;
	};
	comp.css = Extended.css;
	comp.toString = () => Extended;
	return comp;
})();
export const override = "override-k1mzgd";
export const App = () => <Extended class={override}>hi</Extended>;
