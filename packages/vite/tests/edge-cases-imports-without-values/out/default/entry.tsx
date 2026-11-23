// @ts-nocheck
import { css } from "@style-this/core";
// not `import type`, the file has no values to import
import Size, { Theme } from "./types";
import * as types from "./types";
import "virtual:style-this:/entry.tsx.css";
const pick = (theme: Theme) => theme.color;
const scale = (size: Size) => size.value * 2;
export const box = "box-63wxif";
