export const css = (..._raw: any): string => {
  throw new Error(
    "@style-this: called 'css' at runtime. This indicates an error in the transform.",
  );
};
