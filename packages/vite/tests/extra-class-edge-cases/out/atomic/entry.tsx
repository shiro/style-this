// @ts-nocheck
import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// extraClass at the beginning, then CSS after
const test1 = _styleThisClasses.test1;
// extraClass at the end, after CSS
const test2 = _styleThisClasses.test2;
// extraClass as the only thing in the CSS block
const test3 = _styleThisClasses.test3;
// Three extraClass calls in the same css block
const test4 = _styleThisClasses.test4;
// Child styled component extends parent, both have extraClass
const ParentStyled = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_ParentStyled_4;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <div {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
const ChildStyled = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_ChildStyled_2;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <ParentStyled {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// Multiple spaces and mixed positioning
const test5 = _styleThisClasses.test5;
// Empty extraClass
const test6 = _styleThisClasses.test6;
// Only spaces
const test7 = _styleThisClasses.test7;
