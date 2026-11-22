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
	let __styleThis__class = _styleThisClasses.__styleThis_var_FancyButton_12;
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
		let __styleThis__class = _styleThisClasses.__styleThis_var_ui_7;
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
	let __styleThis__class = _styleThisClasses.__styleThis_var_component_0_2;
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
const unrelated = _styleThisClasses.unrelated;
