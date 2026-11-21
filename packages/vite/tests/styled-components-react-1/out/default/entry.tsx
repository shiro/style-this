// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import { forwardRef as __styleThis__forwardRef } from "react";
import "virtual:style-this:/entry.tsx.css";
// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };
export const FancyButton = (() => {
	let FancyButton = "FancyButton-b05mnk";
	let __styleThis__comp = __styleThis__forwardRef((__styleThis__props, __styleThis__ref) => {
		const { styleProps: __styleThis__styleProps, style: __styleThis__style,...__styleThis__rest } = __styleThis__props;
		return <button {...__styleThis__rest} ref={__styleThis__ref} className={__styleThis__mergeStyles(FancyButton, __styleThis__rest.className)} style={{
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
	__styleThis__comp.toString = () => FancyButton;
	return __styleThis__comp;
})();
const unrelated = "unrelated-hqnklm";
