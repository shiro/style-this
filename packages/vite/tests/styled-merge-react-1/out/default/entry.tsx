// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const Base = (() => {
	let Base = "Base-ajwd67";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <button {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(Base, __styleThis__props.className)} />);
	__styleThis__comp.css = Base.css;
	__styleThis__comp.toString = () => Base;
	return __styleThis__comp;
})();
// overrides Base's padding, Base merges this component's classes last
export const Extended = (() => {
	let Extended = "Extended-ir85yz";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <Base {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(Extended, __styleThis__props.className)} />);
	__styleThis__comp.css = Extended.css;
	__styleThis__comp.toString = () => Extended;
	return __styleThis__comp;
})();
export const override = "override-w9ezgl";
export const App = () => <Extended className={override}>hi</Extended>;
