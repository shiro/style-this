// @ts-nocheck
import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
// extraClass at the beginning, then CSS after
const test1 = "test1-6z85mr beginning";
// extraClass at the end, after CSS
const test2 = "test2-rkpq3k ending";
// extraClass as the only thing in the CSS block
const test3 = "test3-mvkpe7 only-thing";
// Three extraClass calls in the same css block
const test4 = "test4-cxebwl first fourth second third";
// Child styled component extends parent, both have extraClass
const ParentStyled = (() => {
	let __styleThis__class = "ParentStyled-difgta parent-class";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <div {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
const ChildStyled = (() => {
	let __styleThis__class = "ChildStyled-hyrg5m child-class";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <ParentStyled {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// Multiple spaces and mixed positioning
const test5 = "test5-9ibg5y class1 class2 class3 class4 class5";
// Empty extraClass
const test6 = "test6-9e3s16";
// Only spaces
const test7 = "test7-ijc9m3";
