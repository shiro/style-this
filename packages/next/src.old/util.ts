export type Filter = RegExp | ((filepath: string) => boolean);

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

