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
