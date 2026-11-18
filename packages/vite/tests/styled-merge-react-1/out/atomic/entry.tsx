// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const Base = (() => {
	let Base = _styleThisClasses.__styleThis_var_Base_4;
	let comp = __styleThis__forwardRef((props, ref) => <button {...props} ref={ref} className={__styleThis__mergeStyles(Base, props.className)} />);
	comp.css = Base.css;
	comp.toString = () => Base;
	return comp;
})();
// overrides Base's padding, Base merges this component's classes last
export const Extended = (() => {
	let Extended = _styleThisClasses.__styleThis_var_Extended_2;
	let comp = __styleThis__forwardRef((props, ref) => <Base {...props} ref={ref} className={__styleThis__mergeStyles(Extended, props.className)} />);
	comp.css = Extended.css;
	comp.toString = () => Extended;
	return comp;
})();
export const override = _styleThisClasses.override;
export const App = () => <Extended className={override}>hi</Extended>;
