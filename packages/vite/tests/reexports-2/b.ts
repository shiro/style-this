import * as tokens from "./d";

export * from "./c";
export * from "./d";
export * as palette from "./palette";
export { tokens };
// takes precedence over `own` of `./c`
export const own = "white";
