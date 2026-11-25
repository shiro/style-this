// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };
export const FancyButton = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_FancyButton_34;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style, ...__styleThis__rest } = __styleThis__props;
		return <button {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__rest.className)} style={{
			"--var1-4lyfgx": (({ a }) => a)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var2-ngdi74": (() => props.gap)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			...__styleThis__props.style ?? {}
		}} />;
	});
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// must not be shadowed by the generated wrapper's class variable
const ui = {
	accent: "red",
	Card: (() => {
		let __styleThis__class = _styleThisClasses.__styleThis_var_ui_29;
		let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
			const { styleProps: __styleThis__styleProps, style: __styleThis__style, ...__styleThis__rest } = __styleThis__props;
			return <div {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__rest.className)} style={{
				"--var1-52r4dq": (() => ui.accent)({
					...__styleThis__props.styleProps,
					"props": __styleThis__props
				}),
				...__styleThis__props.style ?? {}
			}} />;
		});
		__styleThis__comp.toString = () => __styleThis__class;
		return __styleThis__comp;
	})()
};
export default (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_component_0_24;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style, ...__styleThis__rest } = __styleThis__props;
		return <div {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__rest.className)} style={{
			"--var1-9a7oly": (() => ui.accent)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			...__styleThis__props.style ?? {}
		}} />;
	});
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
const unrelated = _styleThisClasses.unrelated;
export const Link = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_Link_19;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style, ...__styleThis__rest } = __styleThis__props;
		return <a {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__rest.className)} style={{
			"--var1-o5uvsl": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			...__styleThis__props.style ?? {}
		}} />;
	});
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const Panel = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_Panel_17;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <ui.Card {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} style={{
		"--var1-wh6b89": (() => ui.accent)({
			...__styleThis__props.styleProps,
			"props": __styleThis__props
		}),
		...__styleThis__props.style ?? {}
	}} />);
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// lowercase and computed bases are components, not HTML elements
const card = (p: {
	className?: string;
}) => <div className={p.className} />;
const components = { Card: card };
export const LowercaseBase = (() => {
	const __styleThis__Base = card;
	let __styleThis__class = _styleThisClasses.__styleThis_var_LowercaseBase_14;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <__styleThis__Base {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const ComputedBase = (() => {
	const __styleThis__Base = components["Card"];
	let __styleThis__class = _styleThisClasses.__styleThis_var_ComputedBase_11;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <__styleThis__Base {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} style={{
		"--var1-rwtif4": (() => ui.accent)({
			...__styleThis__props.styleProps,
			"props": __styleThis__props
		}),
		...__styleThis__props.style ?? {}
	}} />);
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
export const TemplateTag = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_TemplateTag_9;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <span {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// wrapped and non-arrow functions are runtime style functions too
export const StyleFunctions = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var_StyleFunctions_4;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style, ...__styleThis__rest } = __styleThis__props;
		return <div {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__rest.className)} style={{
			"--var1-092f0p": function({ size }) {
				return size;
			}({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var2-f8pmv0": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var3-8xy3w9": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			"--var4-enwhqr": (({ size }) => size)({
				...__styleThis__props.styleProps,
				"props": __styleThis__props
			}),
			...__styleThis__props.style ?? {}
		}} />;
	});
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
// styled components are scoped even with a `_Global` name
export const _GlobalBar = (() => {
	let __styleThis__class = _styleThisClasses.__styleThis_var__GlobalBar_2;
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => <div {...__styleThis__props} ref={__styleThis__ref} className={__styleThis__mergeStyles(__styleThis__class, __styleThis__props.className)} />);
	__styleThis__comp.css = __styleThis__class.css;
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
