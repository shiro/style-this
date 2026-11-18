// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const Base = (() => {
	let Base = "Base-ajwd67";
	let comp = __styleThis__forwardRef((props, ref) => <button {...props} ref={ref} className={__styleThis__mergeStyles(Base, props.className)} />);
	comp.css = Base.css;
	comp.toString = () => Base;
	return comp;
})();
// overrides Base's padding, Base merges this component's classes last
export const Extended = (() => {
	let Extended = "Extended-ir85yz";
	let comp = __styleThis__forwardRef((props, ref) => <Base {...props} ref={ref} className={__styleThis__mergeStyles(Extended, props.className)} />);
	comp.css = Extended.css;
	comp.toString = () => Extended;
	return comp;
})();
export const override = "override-w9ezgl";
export const App = () => <Extended className={override}>hi</Extended>;
