// @ts-nocheck
import { css as cx } from "@style-this/core";
import { styled as s } from "@style-this/solid";
import * as st from "@style-this/core";
import * as sd from "@style-this/solid";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const NsBase = _styleThisClasses.NsBase;
export const NsButton = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_NsButton_4;
	let __styleThis__comp = (__styleThis__props) => {
		return <span {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// shadowed by the parameter, not ours
export const shadowed = (cx: any) => cx`color: green;`;
export const Base = _styleThisClasses.Base;
export const FancyButton = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_FancyButton_2;
	let __styleThis__comp = (__styleThis__props) => {
		return <button {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
