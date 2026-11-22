// @ts-nocheck
import { styled } from "@style-this/react";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let __styleThis__class = "FancyButton-yb0pqr";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <button {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
