// @ts-nocheck
import { css } from "@style-this/core";
import store, { color as accent, track as trackEvent } from "./lib";
import { open } from "./browser";
import * as _styleThisClasses from "virtual:style-this:./entry.tsx.style-this.js";
import "virtual:style-this:/entry.tsx.css";
// references the ignored imports without calling them during evaluation
const getColor = (onClick?: () => void) => onClick ? (trackEvent(store), open()) : accent;
export const button = _styleThisClasses.button;
