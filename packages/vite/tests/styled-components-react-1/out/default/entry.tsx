// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };
export const FancyButton = (() => {
	let __styleThis__class = "FancyButton-dq3g1a";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style,...__styleThis__rest } = __styleThis__props;
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
		let __styleThis__class = "ui-di3she";
		let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
			const { styleProps: __styleThis__styleProps, style: __styleThis__style,...__styleThis__rest } = __styleThis__props;
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
	let __styleThis__class = "component_0-6j4xij";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style,...__styleThis__rest } = __styleThis__props;
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
const unrelated = "unrelated-2r0luv";
export const Link = (() => {
	let __styleThis__class = "Link-b05mnk";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style,...__styleThis__rest } = __styleThis__props;
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
	let __styleThis__class = "Panel-hqnklm";
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
