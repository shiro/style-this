// @ts-nocheck
import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";
import * as _styleThisClasses from "virtual:style-this:/entry.tsx.style-this.js";
import "virtual:style-this:/home/shiro/project/style-this/packages/vite/tests/extra-class-edge-cases/entry.tsx.css";
// extraClass at the beginning, then CSS after
const test1 = _styleThisClasses._styleThis_test1 + " beginning";
// extraClass at the end, after CSS
const test2 = _styleThisClasses._styleThis_test2 + " ending";
// extraClass as the only thing in the CSS block
const test3 = _styleThisClasses._styleThis_test3 + " only-thing";
// Three extraClass calls in the same css block
const test4 = _styleThisClasses._styleThis_test4 + " first second third fourth";
// Child styled component extends parent, both have extraClass
const ParentStyled = (() => {
	let ParentStyled = _styleThisClasses._styleThis_var_ParentStyled_4 + " parent-class";
	let comp = (props) => <div {...props} className={props.className ? ParentStyled + (" " + props.className) : ParentStyled} />;
	comp.css = ParentStyled.css;
	comp.toString = () => ParentStyled;
	return comp;
})();
const ChildStyled = (() => {
	let ChildStyled = _styleThisClasses._styleThis_var_ChildStyled_2 + " child-class";
	let comp = (props) => <ParentStyled {...props} className={props.className ? ChildStyled + (" " + props.className) : ChildStyled} />;
	comp.css = ChildStyled.css;
	comp.toString = () => ChildStyled;
	return comp;
})();
// Multiple spaces and mixed positioning
const test5 = _styleThisClasses._styleThis_test5 + " class1 class2 class3 class4 class5";
// Empty extraClass
const test6 = _styleThisClasses._styleThis_test6;
// Only spaces
const test7 = _styleThisClasses._styleThis_test7;
