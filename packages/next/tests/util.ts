import path from "path";
import { createRequire } from "node:module";

type LoaderResult = { err: Error | null | undefined; result?: string };

export const runLoader = (loader: Function, code: string, resource: string, options = {}) =>
  new Promise<LoaderResult>((resolve) => {
    const callback = (err: Error | null | undefined, result?: string | Buffer) =>
      resolve({ err, result: result?.toString() });
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
        getDependencies: () => [],
        getResolve:
          () =>
          (context: string, request: string, cb: (err: Error | null, result?: string) => void) => {
            try {
              cb(null, createRequire(path.join(context, "noop.js")).resolve(request));
            } catch (err) {
              cb(err as Error);
            }
          },
      },
      Buffer.from(code),
    );
  });

/** The virtual module import the transform inserted into `filepath`, as a resource for its loader. */
export const virtualImport = (filepath: string, code: string, noopFile: string) => {
  const source = code.match(new RegExp(`"([^"]+${noopFile.replaceAll(".", "\\.")}\\?filepath=[^"]+)"`))![1];
  return path.resolve(path.dirname(filepath), source);
};
