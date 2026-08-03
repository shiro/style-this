// @ts-nocheck
import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";
import "virtual:style-this:/entry.tsx.css";
// extraClass at the beginning, then CSS after
const test1 = "test1-6z85mr beginning";
// extraClass at the end, after CSS
const test2 = "test2-rkpq3k ending";
// extraClass as the only thing in the CSS block
const test3 = "test3-mvkpe7 only-thing";
// Three extraClass calls in the same css block
const test4 = "test4-cxebwl first second third fourth";
// Child styled component extends parent, both have extraClass
const ParentStyled = (() => {
	let ParentStyled = "ParentStyled-difgta parent-class";
	let comp = (props) => <div {...props} className={ParentStyled + (" " + (props.className ?? ""))} />;
	comp.css = ParentStyled.css;
	comp.toString = () => ParentStyled;
	return comp;
})();
const ChildStyled = (() => {
	let ChildStyled = "ChildStyled-hyrg5m child-class";
	let comp = (props) => <ParentStyled {...props} className={ChildStyled + (" " + (props.className ?? ""))} />;
	comp.css = ChildStyled.css;
	comp.toString = () => ChildStyled;
	return comp;
})();
// Multiple spaces and mixed positioning
const test5 = "test5-9ibg5y class1 class2 class3 class4 class5";
// Empty extraClass
const test6 = "test6-9e3s16";
// Only spaces
const test7 = "test7-ijc9m3";
