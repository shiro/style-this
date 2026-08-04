// @ts-nocheck
import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";
import "virtual:style-this:/entry.tsx.css";
// extraClass at the beginning, then CSS after
const test1 = "test1-mjkxqr beginning";
// extraClass at the end, after CSS
const test2 = "test2-laf49q ending";
// extraClass as the only thing in the CSS block
const test3 = "test3-fg1mnw only-thing";
// Three extraClass calls in the same css block
const test4 = "test4-05ej4p first second third fourth";
// Child styled component extends parent, both have extraClass
const ParentStyled = (() => {
	let ParentStyled = "ParentStyled-rox6v0 parent-class";
	let comp = (props) => <div {...props} className={props.className ? ParentStyled + (" " + props.className) : ParentStyled} />;
	comp.css = ParentStyled.css;
	comp.toString = () => ParentStyled;
	return comp;
})();
const ChildStyled = (() => {
	let ChildStyled = "ChildStyled-vkdq34 child-class";
	let comp = (props) => <ParentStyled {...props} className={props.className ? ChildStyled + (" " + props.className) : ChildStyled} />;
	comp.css = ChildStyled.css;
	comp.toString = () => ChildStyled;
	return comp;
})();
// Multiple spaces and mixed positioning
const test5 = "test5-wpmjod class1 class2 class3 class4 class5";
// Empty extraClass
const test6 = "test6-fglmzo";
// Only spaces
const test7 = "test7-2zsxyf";
