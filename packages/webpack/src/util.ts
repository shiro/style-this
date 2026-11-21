import { relative, sep } from "path";
import type { RawLoaderDefinitionFunction } from "webpack";
import remapping, { type SourceMapInput } from "@jridgewell/remapping";

export type Filter = RegExp | ((filepath: string) => boolean);
type InputSourceMap = Parameters<RawLoaderDefinitionFunction>[1];

/** The transform's `sourcemap`, traced through the map of the loaders that ran before. */
export const chainSourceMap = (sourcemap: string, inputSourceMap: InputSourceMap) =>
  inputSourceMap
    ? remapping([sourcemap, inputSourceMap as SourceMapInput], () => null)
    : JSON.parse(sourcemap);

/** Whether `filepath` is inside `cwd`'s `node_modules`, `/` and `\` separators are both accepted on Windows. */
export const isInNodeModules = (cwd: string, filepath: string) =>
  relative(cwd, filepath).split(sep, 1)[0] === "node_modules";

export const filterMatches = (filter: Filter[], filepath: string) => {
  return (
    filter.length == 0 ||
    filter.some((filter) =>
      filter instanceof RegExp ? filter.test(filepath) : filter(filepath),
    )
  );
};

export const handleTransformError = (err: unknown) => {
  if (!(err instanceof Error)) throw err;

  // webpack doesn't print cause, add it to the message
  if (err.cause instanceof Error) {
    err.message += `\nCause:\n${err.cause.message}`;
    if (err.cause.stack) {
      err.message += `\nStack:\n${err.cause.stack.toString()}`;
    }
  }

  throw err;
};

