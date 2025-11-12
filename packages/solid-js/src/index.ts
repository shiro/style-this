import { Component, ComponentProps, JSX } from "solid-js";

type StyledComponent<T extends keyof JSX.IntrinsicElements> = (
  ...raw: any
) => Component<ComponentProps<T>> & StyledComponentExtensions;

type StyledProxy = {
  [K in keyof JSX.IntrinsicElements]: StyledComponent<K>;
};

type StyledComponentExtensions = { class: string };

export const styled = new Proxy({} as StyledProxy, {
  get<T extends keyof JSX.IntrinsicElements>(target: StyledProxy, prop: T) {
    return (..._raw: any): StyledComponent<T> => {
      throw new Error(
        `@style-this: called 'styled.${String(prop)}' at runtime. This indicates an error in the transform.`,
      );
    };
  },
});
