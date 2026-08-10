// @ts-nocheck
import { css } from "@style-this/core";
import "virtual:style-this:__atomic_entrypoint.css";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// Inner component with base styles
const innerStyle = _styleThisClasses.innerStyle;
// Outer component - wraps inner and overrides background to coral
// Uses CSS selector to target inner component
const outerStyle = _styleThisClasses.outerStyle;
export { outerStyle, innerStyle };
