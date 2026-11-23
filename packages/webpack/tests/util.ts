import path from "path";
import { createRequire } from "node:module";
import { webpackLoaderConfig, type LoaderOptions } from "../src/loaders/consts";
import { getState } from "../src/loaders/transform";

type LoaderResult = { err: Error | null | undefined; result?: string; map?: unknown };
type ResolveCallback = (err: Error | null, result?: string) => void;

export const resolveRequest = (context: string, request: string, cb: ResolveCallback) => {
  try {
    const [file, query] = request.split("?", 2);
    const resolved = createRequire(path.join(context, "noop.js")).resolve(file);
    cb(null, query === undefined ? resolved : `${resolved}?${query}`);
  } catch (err) {
    cb(err as Error);
  }
};

// vitest's module runner doesn't support the dynamic `import()` of evaluations
const loaderOptions = (options: LoaderOptions) => ({ useRequire: true, ...options });

/** The transformer and virtual modules the loaders with `options` share. */
export const loaderState = (options: LoaderOptions = {}) => getState(webpackLoaderConfig(loaderOptions(options)));

/** `ctx` overrides fields of the loader context. */
export const runLoader = (
  loader: Function,
  code: string,
  resource: string,
  options: LoaderOptions = {},
  ctx: {
    addDependency?: (file: string) => void;
    getResolve?: (options: { fullySpecified?: boolean }) => typeof resolveRequest;
  } = {},
  inputSourceMap?: unknown,
) =>
  new Promise<LoaderResult>((resolve) => {
    const callback = (err: Error | null | undefined, result?: string | Buffer, map?: unknown) =>
      resolve({ err, result: result?.toString(), map });
    const queryStart = resource.indexOf("?");
    loader.call(
      {
        resourcePath: queryStart === -1 ? resource : resource.slice(0, queryStart),
        resourceQuery: queryStart === -1 ? "" : resource.slice(queryStart),
        async: () => callback,
        getOptions: () => loaderOptions(options),
        callback,
        addDependency: () => {},
        getResolve: () => resolveRequest,
        ...ctx,
      },
      Buffer.from(code),
      inputSourceMap,
    );
  });

/** The virtual module import the transform inserted into `filepath`, as a resource for its loader. */
export const virtualImport = (filepath: string, code: string, noopFile: string) => {
  const source = code.match(new RegExp(`"([^"]+${noopFile.replaceAll(".", "\\.")}\\?filepath=[^"]+)"`))![1];
  return path.resolve(path.dirname(filepath), source);
};
