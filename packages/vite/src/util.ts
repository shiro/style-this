import { readFileSync } from "fs";
import path from "path";

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

const readFileOrUndefined = (filepath: string) => {
  try {
    return readFileSync(filepath, "utf-8");
  } catch {
    return undefined;
  }
};

export const handleTransformError = (
  id: string,
  code: string,
  maybeErr: unknown,
) => {
  if (!(maybeErr instanceof Error)) throw maybeErr;
  const err = maybeErr.cause instanceof Error ? maybeErr.cause : maybeErr;

  const stackEntry = err.stack?.split("\n")[1];
  if (!stackEntry) throw err;

  const locationMatch = /\((.+):(\d+):(\d+)\)/.exec(stackEntry);

  const filepath = locationMatch?.[1] ?? id;
  const loc = locationMatch
    ? {
        line: parseInt(locationMatch[2]),
        column: parseInt(locationMatch[3]),
        file: filepath,
      }
    : undefined;

  let frame: string | undefined;
  // the error can be located in a dependency of `id`
  const frameCode = filepath === id ? code : readFileOrUndefined(filepath);

  if (loc && frameCode !== undefined) {
    const lines = frameCode.split("\n");
    const startLineNr = Math.max(0, loc.line - 3);
    const endLineNr = Math.min(lines.length, loc.line + 2);
    const padding = endLineNr.toString().length;

    frame = "";
    for (let i = startLineNr; i < endLineNr; i++) {
      const lineNr = i + 1;
      const isErrorLine = lineNr === loc.line;
      const prefix = isErrorLine ? ">" : " ";
      frame += `${prefix} ${lineNr.toString().padStart(padding)} | ${lines[i]}\n`;

      if (isErrorLine && loc.column > 0) {
        const spaces = " ".repeat(4 + padding + loc.column);
        frame += `${spaces}^ ${err.message}\n`;
      }
    }
  }

  throw {
    name: err.name,
    id: filepath,
    message: err.message,
    code: (err as any).code,
    stack: err.stack,
    loc,
    frame,
  };

  // err.id = "/home/shiro/project/style-this/examples/vite-solid/src/Counter.tsx";
  // err.loc = {
  //   line: 1,
  //   column: 1,
  //   id: "/home/shiro/project/style-this/examples/vite-solid/src/Counter.tsx",
  // };

  // throw err;

  // vite doesn't print cause, add it to the message
  // if (err.cause instanceof Error) {
  //   err.message += `\nCause:\n${err.cause.message}`;
  //   if (err.cause.stack) {
  //     err.message += `\nStack:\n${err.cause.stack.toString()}`;
  //   }
  // }
  //
  // throw err;
};
