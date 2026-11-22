// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const Base = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_Base_4;
	let __styleThis__comp = (__styleThis__props) => {
		return <button {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// overrides Base's padding, Base merges this component's classes last
export const Extended = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_Extended_2;
	let __styleThis__comp = (__styleThis__props) => {
		return <Base {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const override = _styleThisClasses.override;
export const App = () => <Extended class={override}>hi</Extended>;
