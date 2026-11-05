// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { joinStyles as __styleThis__mergeStyles } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = "FancyButton-b05mnk";
	let comp = (props) => {
		const { styleProps: _styleProps, style: _style,...rest } = props;
		return <button {...rest} className={__styleThis__mergeStyles(FancyButton, rest.className)} style={{
			"--var1-2nwhuj": (({ a }) => a)({
				...props.styleProps,
				"props": props
			}),
			...props.style ?? {}
		}} />;
	};
	comp.toString = () => FancyButton;
	return comp;
})();
const unrelated = "unrelated-hqnklm";
