export type Filter = RegExp | ((filepath: string) => boolean);

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
  const err = maybeErr.cause instanceof Error ? maybeErr.cause : maybeErr;

  console.log("stack", err.stack);

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

  if (loc) {
    const lines = code.split("\n");
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
