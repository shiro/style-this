import { css } from "@style-this/core";
import "virtual:style-this:/entry.tsx.css";
const doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
const a = "a-y789mr";
