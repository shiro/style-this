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
	let __styleThis__class = "FancyButton-kdmfwx";
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
		let __styleThis__class = "ui-ox634h";
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
	let __styleThis__class = "component_0-s9abk5";
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
const unrelated = "unrelated-r81ubc";
export const Link = (() => {
	let __styleThis__class = "Link-xavwp2";
	let __styleThis__comp = (__styleThis__props) => {
		const [, __styleThis__rest] = __styleThis__splitProps(__styleThis__props, ["styleProps", "style"]);
		return <a {...__styleThis__rest} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({ "--var1-8dybk9": (({ size }) => size)({
			...__styleThis__props.styleProps,
			"props": __styleThis__props
		}) }, __styleThis__props.style)} />;
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const Panel = (() => {
	let __styleThis__class = "Panel-o5uj8x";
	let __styleThis__comp = (__styleThis__props) => {
		return <ui.Card {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({ "--var1-i7wlu7": (() => ui.accent)({
			...__styleThis__props.styleProps,
			"props": __styleThis__props
		}) }, __styleThis__props.style)} />;
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// lowercase and computed bases are components, not HTML elements
const card = (p: {
	class?: string;
}) => <div class={p.class} />;
const components = { Card: card };
export const LowercaseBase = (() => {
	const __styleThis__Base = card;
	let __styleThis__class = "LowercaseBase-fs5q7g";
	let __styleThis__comp = (__styleThis__props) => {
		return <__styleThis__Base {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const ComputedBase = (() => {
	const __styleThis__Base = components["Card"];
	let __styleThis__class = "ComputedBase-p2r0he";
	let __styleThis__comp = (__styleThis__props) => {
		return <__styleThis__Base {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({ "--var1-xu3sdu": (() => ui.accent)({
			...__styleThis__props.styleProps,
			"props": __styleThis__props
		}) }, __styleThis__props.style)} />;
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const TemplateTag = (() => {
	let __styleThis__class = "TemplateTag-052fkl";
	let __styleThis__comp = (__styleThis__props) => {
		return <span {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// wrapped and non-arrow functions are runtime style functions too
export const StyleFunctions = (() => {
	let __styleThis__class = "StyleFunctions-3slijs";
	let __styleThis__comp = (__styleThis__props) => {
		const [, __styleThis__rest] = __styleThis__splitProps(__styleThis__props, ["styleProps", "style"]);
		return <div {...__styleThis__rest} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} style={__styleThis__mergeInlineStyles({
			"--var1-7g9y7o": function({ size }) {
				return size;
			}({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var2-tabwt2": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var3-od23od": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var4-m7412v": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			})
		}, __styleThis__props.style)} />;
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// styled components are scoped even with a `_Global` name
export const _GlobalBar = (() => {
	let __styleThis__class = "_GlobalBar-96jgdy";
	let __styleThis__comp = (__styleThis__props) => {
		return <div {...__styleThis__props} class={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.class)} />;
	};
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
