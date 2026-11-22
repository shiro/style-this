// @ts-nocheck
import { styled } from "@style-this/solid";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { mergeInlineStyles as __styleThis__mergeInlineStyles } from "@style-this/core";
import { splitProps as __styleThis__splitProps } from "solid-js";
import "virtual:style-this:/entry.tsx.css";
// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };
export const FancyButton = (() => {
	let __styleThis__class = "FancyButton-p2r0he";
	let __styleThis__comp = (__styleThis__props) => {
		const [, __styleThis__rest] = __styleThis__splitProps(__styleThis__props, ["styleProps", "style"]);
		return <button {...__styleThis__rest} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({
			"--var1-q3ctyv": (({ a }) => a)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var2-pino9q": (() => props.gap)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			})
		}, __styleThis__props.style)} />;
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// must not be shadowed by the generated wrapper's class variable
const ui = {
	accent: "red",
	Card: (() => {
		let __styleThis__class = "ui-052fkl";
		let __styleThis__comp = (__styleThis__props) => {
			const [, __styleThis__rest] = __styleThis__splitProps(__styleThis__props, ["styleProps", "style"]);
			return <div {...__styleThis__rest} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({ "--var1-xazw1e": (() => ui.accent)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}) }, __styleThis__props.style)} />;
		};
		__styleThis__comp.toString = () => __styleThis__class;
		return __styleThis__comp;
	})()
};
export default (() => {
	let __styleThis__class = "component_0-3slijs";
	let __styleThis__comp = (__styleThis__props) => {
		const [, __styleThis__rest] = __styleThis__splitProps(__styleThis__props, ["styleProps", "style"]);
		return <div {...__styleThis__rest} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({ "--var1-eb8x63": (() => ui.accent)({
			...__styleThis__props.styleProps,
			"props": __styleThis__props
		}) }, __styleThis__props.style)} />;
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
const unrelated = "unrelated-96jgdy";
