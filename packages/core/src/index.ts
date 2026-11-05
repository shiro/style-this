import atomicPrefixes from "./atomicPrefixes.json";

export type CSSProperties = {
  [key: string]: string | number | CSSProperties;
};

type CSS = string & {
  css: string;
};

export const css = (..._raw: any): CSS => {
  throw new Error(
    "@style-this: called 'css' at runtime. This indicates an error in the transform.",
  );
};

export const style = (
  s: TemplateStringsArray,
  ...expr: Array<string | number | CSSProperties>
): string => {
  let res = "";
  for (let i = 0; i < Math.max(s.length, expr.length); ++i) {
    res += s[i] ?? "";
    res += expr[i] ?? "";
  }
  return res;
};

export const extraClass = (..._classes: string[]): string => {
  throw new Error(
    "@style-this: called 'extraClass' at runtime. This indicates an error in the transform.",
  );
};

const ATOMIC_PREFIXES = new Set<string>(Object.values(atomicPrefixes));
const ATOMIC_HASH_LENGTH = 5;

// atomic classes are `<prefix>-<5 char hash>`, where the hash starts with a letter
const getAtomicPrefix = (className: string): string | undefined => {
  const separatorIdx = className.length - ATOMIC_HASH_LENGTH - 1;
  if (separatorIdx < 1 || className[separatorIdx] !== "-") return;
  if (!/[a-zA-Z]/.test(className[separatorIdx + 1])) return;
  const prefix = className.slice(0, separatorIdx);
  return ATOMIC_PREFIXES.has(prefix) ? prefix : undefined;
};

type ClassValue = string | false | null | undefined;

/** Joins class lists, ignoring falsy values. */
export const joinStyles = (...classes: Array<ClassValue>): string =>
  classes.filter(Boolean).join(" ");

/**
 * Joins class lists, de-duping atomic classes of the same property (e.g. `m-xxxxx`), the last one wins.
 * Other classes are only de-duped if identical. Falsy values are ignored.
 * In non-atomic mode the transform replaces this with `joinStyles`.
 */
export const mergeStyles = (...classes: Array<ClassValue>): string => {
  const merged = new Map<string, string>();
  for (const classList of classes) {
    if (!classList) continue;
    for (const className of classList.split(/\s+/)) {
      if (!className) continue;
      const key = getAtomicPrefix(className) ?? className;
      merged.delete(key);
      merged.set(key, className);
    }
  }
  return [...merged.values()].join(" ");
};
