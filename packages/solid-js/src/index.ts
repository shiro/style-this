import { Component, ComponentProps, JSX } from "solid-js";

// Component.class
// TODO remove this in favor of `.toString()`
type StyledComponentExtensions = {
  readonly class: string;
  readonly css: string;
};

type TemplateExpression<StyleProps> =
  | string
  | number
  | ((styleProps: StyleProps) => string | number);

type StyledProxy = {
  [Element in keyof JSX.IntrinsicElements]: <
    StyleProps extends Record<string, any>,
  >(
    s: TemplateStringsArray,
    ...expr: Array<TemplateExpression<StyleProps>>
  ) => Component<
    ComponentProps<Element> & {
      styleProps: StyleProps;
    }
  > &
    StyledComponentExtensions;
};

export const styled = new Proxy({} as StyledProxy, {
  get<Element extends keyof JSX.IntrinsicElements>(
    _target: StyledProxy,
    elementName: Element,
  ): StyledProxy[Element] {
    return (..._args: any) => {
      throw new Error(
        `@style-this: called 'styled.${String(elementName)}' at runtime. This indicates an error in the transform.`,
      );
    };
  },
});
