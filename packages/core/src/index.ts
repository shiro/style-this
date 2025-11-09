export const css = (..._raw: any): string => {
  throw new Error(
    "vite:stylistic: called 'css' at runtime. This indicates an error in the transform.",
  );
};
