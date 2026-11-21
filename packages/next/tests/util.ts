import path from "path";
import { createRequire } from "node:module";

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

/** `ctx` overrides fields of the loader context. */
export const runLoader = (
  loader: Function,
  code: string,
  resource: string,
  options = {},
  ctx: { addDependency?: (file: string) => void; getResolve?: () => typeof resolveRequest } = {},
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
        getOptions: () => options,
        callback,
        cacheable: () => {},
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
