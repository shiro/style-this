import path from "path";
import { locateTransformError } from "@style-this/core/transformError";
import { svelteFileLocation } from "./svelte";

export type Filter = RegExp | ((filepath: string) => boolean);

/**
 * Posix path like vite ids (`path` returns `\` on Windows). Same as vite's `normalizePath`, but it follows
 * `path` instead of the platform, so it's testable with `path.win32`.
 */
export const normalizePath = (filepath: string) => path.posix.normalize(filepath.replaceAll(path.sep, "/"));

/**
 * Path of the virtual id of `filepath`. Virtual ids end up in bundle output (e.g. region comments), keep them
 * relative to `cwd` so output and chunk hashes don't depend on the project location.
 */
export const toVirtualPath = (cwd: string, filepath: string) => {
  const relativePath = path.relative(cwd, filepath);
  return normalizePath(relativePath.startsWith("..") || path.isAbsolute(relativePath) ? filepath : relativePath);
};

export const fromVirtualPath = (cwd: string, virtualPath: string) => normalizePath(path.resolve(cwd, virtualPath));

/**
 * Whether `filepath` is inside any `node_modules`, e.g. the workspace root's in monorepos. `/` and `\`
 * separators are both accepted on Windows.
 */
export const isInNodeModules = (filepath: string) => /[\\/]node_modules[\\/]/.test(filepath);

/** Splits on the first `?`, the query can contain more. */
export const splitQuery = (id: string): [string, string | undefined] => {
  const index = id.indexOf("?");
  return index === -1 ? [id, undefined] : [id.slice(0, index), id.slice(index + 1)];
};

const TIMEOUT = Symbol("TIMEOUT");

/**
 * Wraps a promise with a timeout. Returns a promise that races the input promise
 * against a timeout. If the timeout wins, it rejects with the TIMEOUT symbol.
 * The returned promise properly cleans up the timeout when the race completes.
 */
export function timeoutPromise<T>(
  promise: Promise<T>,
  timeoutDuration: number,
): Promise<T> {
  const controller = new AbortController();

  const timeoutPromiseInternal = new Promise<T>((_, reject) => {
    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        reject(TIMEOUT);
      }
    }, timeoutDuration);

    // Clear timeout when aborted
    controller.signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
    });
  });

  return Promise.race([promise, timeoutPromiseInternal]).finally(() => {
    controller.abort();
  });
}

/**
 * Export TIMEOUT symbol for use in error checking
 */
export { TIMEOUT };

export const filterMatches = (filter: Filter[], filepath: string) => {
  return (
    filter.length == 0 ||
    filter.some((filter) =>
      filter instanceof RegExp ? filter.test(filepath) : filter(filepath),
    )
  );
};

export const handleTransformError = (
  id: string,
  code: string,
  maybeErr: unknown,
) => {
  if (!(maybeErr instanceof Error)) throw maybeErr;
  const { error, file, loc, frame } = locateTransformError(maybeErr, id, code, svelteFileLocation);

  throw {
    name: error.name,
    id: file,
    message: error.message,
    code: (error as any).code,
    stack: error.stack,
    loc,
    frame,
  };
};
