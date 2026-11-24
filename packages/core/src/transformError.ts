import { readFileSync } from "fs";

/** A 1-based position in `file`. */
export type ErrorLocation = { file: string; line: number; column: number };

const readFileOrUndefined = (filepath: string) => {
  try {
    return readFileSync(filepath, "utf-8");
  } catch {
    return undefined;
  }
};

/** The lines of `code` around `loc`, pointing at it with `message`. */
const codeFrame = (code: string, loc: ErrorLocation, message: string) => {
  const lines = code.split("\n");
  const startLineNr = Math.max(0, loc.line - 3);
  const endLineNr = Math.min(lines.length, loc.line + 2);
  const padding = endLineNr.toString().length;

  let frame = "";
  for (let i = startLineNr; i < endLineNr; i++) {
    const lineNr = i + 1;
    const isErrorLine = lineNr === loc.line;
    frame += `${isErrorLine ? ">" : " "} ${lineNr.toString().padStart(padding)} | ${lines[i]}\n`;
    if (isErrorLine && loc.column > 0) frame += `${" ".repeat(4 + padding + loc.column)}^ ${message}\n`;
  }
  return frame;
};

/**
 * Locates the error the transform of `filepath` failed with. Errors of evaluated code are the cause of the
 * compiler's error, located at their first stack frame or, without a location, in the evaluated file (`filepath`
 * or a dependency). Other errors are located by the compiler, or in `filepath`. The code frame is of `code` for
 * `filepath`, other files are read. `mapLocation` maps a location in the code the compiler transformed to the file's
 * `code`, e.g. for files it transforms a part of.
 */
export const locateTransformError = (
  err: Error,
  filepath: string,
  code: string,
  mapLocation: (loc: ErrorLocation, code: string) => ErrorLocation = (loc) => loc,
): { error: Error; file: string; loc?: ErrorLocation; frame?: string } => {
  const evaluatedFile = (err as { filepath?: string }).filepath;
  const error = err.cause instanceof Error ? err.cause : err;
  // the causes of other compiler errors are thrown by the plugin (e.g. its `loadFile`), their stack isn't the source's
  const position =
    error === err || evaluatedFile !== undefined ? /\((.+):(\d+):(\d+)\)/.exec(error.stack?.split("\n")[1] ?? "") : null;
  const file = position?.[1] ?? evaluatedFile ?? filepath;
  if (!position) return { error, file };

  const loc = { file, line: Number(position[2]), column: Number(position[3]) };
  const fileCode = file === filepath ? code : readFileOrUndefined(file);
  if (fileCode === undefined) return { error, file, loc };

  const fileLoc = mapLocation(loc, fileCode);
  return { error, file, loc: fileLoc, frame: codeFrame(fileCode, fileLoc, error.message) };
};
