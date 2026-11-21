type LoaderResult = { err: Error | null | undefined; result?: string; map?: unknown };

export const runLoader = (loader: Function, code: string, resourcePath: string, inputSourceMap?: unknown) =>
  new Promise<LoaderResult>((resolve) => {
    const callback = (err: Error | null | undefined, result?: string | Buffer, map?: unknown) =>
      resolve({ err, result: result?.toString(), map });
    loader.call(
      {
        resourcePath,
        async: () => callback,
        callback,
        cacheable: () => {},
        addDependency: () => {},
        getResolve: () => () => {},
      },
      Buffer.from(code),
      inputSourceMap,
    );
  });
