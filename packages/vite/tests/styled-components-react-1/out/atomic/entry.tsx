// @ts-nocheck
import { styled } from "@style-this/react";
import { css } from "@style-this/core";
import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
export const FancyButton = (() => {
	let FancyButton = _styleThisClasses.__styleThis_var_FancyButton_2;
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
const unrelated = _styleThisClasses.unrelated;
