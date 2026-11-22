import atomicPrefixes from "./atomicPrefixes.json";
import atomicShorthands from "./atomicShorthands.json";

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
const prefixOf = (property: string) => (atomicPrefixes as Record<string, string>)[property];
/** Prefix of a shorthand -> prefixes of the longhands it overrides, e.g. `m` -> `mt`, `mb`, ... */
const LONGHAND_PREFIXES = new Map<string, string[]>(
  Object.entries(atomicShorthands).map(([shorthand, longhands]) => [
    prefixOf(shorthand),
    longhands.split(" ").map(prefixOf),
  ]),
);
// `<prefix>-<hash>`, matching the compiler's `generate_atomic_hash`. The uppercase start rules out
// hand-written classes like `bg-light`.
const ATOMIC_CLASS = /^(.+)-[A-Z][\w-]{4}$/;

const getAtomicPrefix = (className: string): string | undefined => {
  const prefix = ATOMIC_CLASS.exec(className)?.[1];
  return prefix && ATOMIC_PREFIXES.has(prefix) ? prefix : undefined;
};

type ClassValue = string | false | null | undefined;

/** Joins class lists, ignoring falsy values. */
export const joinStyles = (...classes: Array<ClassValue>): string =>
  classes.filter(Boolean).join(" ");

/**
 * Joins class lists, de-duping atomic classes of the same property (e.g. `m-xxxxx`), the last one wins.
 * Atomic classes of longhands followed by their shorthand (e.g. `mt-xxxxx` before `m-xxxxx`) are dropped
 * too, longhands would win otherwise. Other classes are only de-duped if identical. Falsy values are ignored.
 * In non-atomic mode the transform replaces this with `joinStyles`.
 */
export const mergeStyles = (...classes: Array<ClassValue>): string => {
  const merged = new Map<string, string>();
  for (const classList of classes) {
    if (!classList) continue;
    for (const className of classList.split(/\s+/)) {
      if (!className) continue;
      const prefix = getAtomicPrefix(className);
      if (prefix) for (const longhand of LONGHAND_PREFIXES.get(prefix) ?? []) merged.delete(longhand);
      const key = prefix ?? className;
      merged.delete(key);
      merged.set(key, className);
    }
  }
  return [...merged.values()].join(" ");
};

type InlineStyle = Record<string, string | number | undefined>;

/**
 * Merges a styled component's CSS variables with the `style` prop, which wins on conflicts.
 * The `style` prop may be a CSS string (e.g. in Solid), in which case CSS text is returned.
 */
export const mergeInlineStyles = (
  vars: InlineStyle,
  style?: InlineStyle | string | null,
): InlineStyle | string => {
  if (typeof style !== "string") return { ...vars, ...style };

  let res = "";
  for (const [name, value] of Object.entries(vars)) {
    if (value != null) res += `${name}:${value};`;
  }
  return res + style;
};
