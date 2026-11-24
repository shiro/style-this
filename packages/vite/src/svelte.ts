import type { ErrorLocation } from "@style-this/core/transformError";

export function isSvelteFile(filepath: string): boolean {
  return filepath.endsWith(".svelte");
}

// comments, `<svelte:head>` (may contain non-component scripts) and styles are matched to skip the scripts in them,
// attribute values may contain `>`, e.g. `generics="T extends Record<string, unknown>"`
const SCRIPT_REGEX =
  /<!--[\s\S]*?-->|<(svelte:head|style)\b[\s\S]*?<\/\1\s*>|<script(?<attributes>(?:\s+[^\s=>"'/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*>(?<content>[\s\S]*?)<\/script\s*>/g;
const MODULE_ATTRIBUTE_REGEX = /\s(?:module(?=[\s=]|$)|context\s*=\s*["']?module\b)/;
const INSTANCE_SCRIPT_SEPARATOR = "/* __styleThis__svelteInstanceScript */";

type SvelteScript = { start: number; end: number; content: string };

/** The content ranges of the module and instance scripts, Svelte allows one of each. */
function findSvelteScripts(code: string) {
  let module: SvelteScript | undefined;
  let instance: SvelteScript | undefined;
  for (const match of code.matchAll(SCRIPT_REGEX)) {
    const { attributes, content } = match.groups ?? {};
    if (content === undefined) continue;
    const end = match.index + match[0].lastIndexOf("</script");
    const script = { start: end - content.length, end, content };
    if (MODULE_ATTRIBUTE_REGEX.test(attributes)) module ??= script;
    else instance ??= script;
  }
  return { module, instance };
}

/** A script's content range in the program (`program`, `length`) and where it starts in the Svelte file (`file`). */
type SvelteScriptRange = { program: number; length: number; file: number };

/** A program, the Svelte file its scripts are placed in, and where they're placed. */
export type SvelteSources = { program: string; file: string; ranges: SvelteScriptRange[] };

/**
 * The code a Svelte file is transformed as, `null` if it has no script. Both scripts share the module's scope, so
 * they're transformed as one program: the module script, followed by the instance script.
 */
export function svelteSources(file: string): SvelteSources | null {
  const { module, instance } = findSvelteScripts(file);
  if (module && instance) {
    const instanceStart = module.content.length + INSTANCE_SCRIPT_SEPARATOR.length + 2;
    return {
      program: `${module.content}\n${INSTANCE_SCRIPT_SEPARATOR}\n${instance.content}`,
      file,
      ranges: [
        { program: 0, length: module.content.length, file: module.start },
        { program: instanceStart, length: instance.content.length, file: instance.start },
      ],
    };
  }
  const script = module ?? instance;
  if (!script) return null;
  return { program: script.content, file, ranges: [{ program: 0, length: script.content.length, file: script.start }] };
}

export function extractSvelteScript(code: string): string | null {
  return svelteSources(code)?.program ?? null;
}

/** Replaces the scripts of `originalCode` with their transformed contents, `file` is the resulting code. */
export function rewrapSvelteScript(originalCode: string, transformedCode: string): SvelteSources {
  const { module, instance } = findSvelteScripts(originalCode);
  const parts: { script: SvelteScript; program: number; length: number }[] = [];
  if (module && instance) {
    const separatorIndex = transformedCode.indexOf(INSTANCE_SCRIPT_SEPARATOR);
    if (separatorIndex === -1) throw new Error("the transformed Svelte script lost the instance script separator");
    const instanceStart = separatorIndex + INSTANCE_SCRIPT_SEPARATOR.length;
    parts.push(
      { script: module, program: 0, length: separatorIndex },
      { script: instance, program: instanceStart, length: transformedCode.length - instanceStart },
    );
  } else {
    const script = module ?? instance;
    if (script) parts.push({ script, program: 0, length: transformedCode.length });
  }

  const ranges: SvelteScriptRange[] = [];
  let file = "";
  let lastEnd = 0;
  for (const { script, program, length } of parts.sort((a, b) => a.script.start - b.script.start)) {
    file += originalCode.slice(lastEnd, script.start);
    ranges.push({ program, length, file: file.length });
    file += transformedCode.slice(program, program + length);
    lastEnd = script.end;
  }
  file += originalCode.slice(lastEnd);
  return { program: transformedCode, file, ranges };
}

/** Maps UTF-8 byte offsets in the program to ones in the file. */
export function svelteByteOffsetMapper({ program, file, ranges }: SvelteSources): (offset: number) => number {
  const byteLength = (code: string, index: number) => Buffer.byteLength(code.slice(0, index));
  const offsets = ranges.map((range) => ({
    program: byteLength(program, range.program),
    file: byteLength(file, range.file),
  }));
  return (offset) => {
    const script = offsets.findLast((script) => script.program <= offset)!;
    return offset - script.program + script.file;
  };
}

/**
 * Remaps the sourcemap of the transformed program, from `original.program` to `generated.program`, to map from
 * `original.file` to `generated.file`. Mappings outside the scripts (e.g. of the instance script separator) are dropped.
 */
export function remapSvelteSourcemap(sourcemap: string, original: SvelteSources, generated: SvelteSources): string {
  const mapOriginal = positionMapper(original);
  const mapGenerated = positionMapper(generated);

  const map = JSON.parse(sourcemap);
  // scripts may be rewrapped in a different order, segments are regrouped by generated line
  const lines: number[][][] = [];
  for (const [programLine, segments] of decodeMappings(map.mappings).entries()) {
    for (const segment of segments) {
      const generatedPosition = mapGenerated(programLine, segment[0]);
      if (!generatedPosition) continue;
      const [line, column] = generatedPosition;
      const originalPosition = segment.length > 1 ? mapOriginal(segment[2], segment[3]) : undefined;
      if (originalPosition) [segment[2], segment[3]] = originalPosition;
      else segment.length = 1;
      segment[0] = column;
      (lines[line] ??= []).push(segment);
    }
  }
  map.mappings = encodeMappings(Array.from(lines, (segments = []) => segments.sort((a, b) => a[0] - b[0])));
  if (map.sourcesContent) map.sourcesContent = [original.file];
  return JSON.stringify(map);
}

/** Maps an error location in the program of a Svelte file to the file's `code`, other files' are kept. */
export function svelteFileLocation(loc: ErrorLocation, code: string): ErrorLocation {
  const sources = isSvelteFile(loc.file) ? svelteSources(code) : null;
  const position = sources && positionMapper(sources)(loc.line - 1, loc.column - 1);
  return position ? { ...loc, line: position[0] + 1, column: position[1] + 1 } : loc;
}

/** Maps line and column positions in the program to ones in the file, `undefined` if outside the scripts. */
function positionMapper({ program, file, ranges }: SvelteSources) {
  const programLines = lineStarts(program);
  const fileLines = lineStarts(file);
  return (line: number, column: number): [number, number] | undefined => {
    const index = programLines[line] + column;
    const range = ranges.find((range) => range.program <= index && index <= range.program + range.length);
    if (!range) return;
    const fileIndex = index - range.program + range.file;
    // binary search for the last line starting at or before `fileIndex`
    let low = 0;
    let high = fileLines.length - 1;
    while (low < high) {
      const middle = (low + high + 1) >> 1;
      if (fileLines[middle] <= fileIndex) low = middle;
      else high = middle - 1;
    }
    return [low, fileIndex - fileLines[low]];
  };
}

function lineStarts(code: string): number[] {
  const starts = [0];
  for (let index = code.indexOf("\n"); index !== -1; index = code.indexOf("\n", index + 1)) starts.push(index + 1);
  return starts;
}

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decodes VLQ mappings into absolute segments per generated line. */
function decodeMappings(mappings: string): number[][][] {
  // fields other than the generated column are relative across lines
  const state = [0, 0, 0, 0, 0];
  return mappings.split(";").map((line) => {
    state[0] = 0;
    return line.split(",").filter(Boolean).map((encoded) => {
      const segment: number[] = [];
      let value = 0;
      let shift = 0;
      for (const char of encoded) {
        const digit = BASE64_CHARS.indexOf(char);
        value += (digit & 31) << shift;
        shift += 5;
        if (digit & 32) continue;
        const field = segment.length;
        state[field] += value & 1 ? -(value >>> 1) : value >>> 1;
        segment.push(state[field]);
        value = shift = 0;
      }
      return segment;
    });
  });
}

function encodeMappings(lines: number[][][]): string {
  const state = [0, 0, 0, 0, 0];
  return lines.map((segments) => {
    state[0] = 0;
    return segments.map((segment) =>
      segment.map((value, field) => {
        const delta = value - state[field];
        state[field] = value;
        let vlq = delta < 0 ? (-delta << 1) | 1 : delta << 1;
        let encoded = "";
        do {
          const digit = vlq & 31;
          vlq >>>= 5;
          encoded += BASE64_CHARS[vlq > 0 ? digit | 32 : digit];
        } while (vlq > 0);
        return encoded;
      }).join("")
    ).join(",");
  }).join(";");
}
