// @ts-nocheck
import { styled as s } from "@style-this/react";
import * as sr from "@style-this/react";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const NsLink = (() => {
	let __styleThis__class = "NsLink-2zwtuz";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <a {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// shadowed by the parameter, not ours
export const shadowed = (s: any) => s.div`color: green;`;
// not ours, must stay untouched
const css = (strings: TemplateStringsArray) => strings.join("");
export const foreign = css`color: red;`;
export const FancyButton = (() => {
	let __styleThis__class = "FancyButton-rkxuj4";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <button {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
