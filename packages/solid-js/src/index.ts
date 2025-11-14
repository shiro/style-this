import { Component, ComponentProps, JSX } from "solid-js";

// Component.class
type CssExtension = {
  readonly css: string;
};

type TemplateExpression<StyleProps> =
  | string
  | number
  | ((styleProps: StyleProps) => string | number);

type StyledProxy = {
  [Element in keyof JSX.IntrinsicElements]: <
    StyleProps extends Record<string, any> = Record<string, never>,
  >(
    s: TemplateStringsArray,
    ...expr: Array<TemplateExpression<StyleProps>>
  ) => Component<
    ComponentProps<Element> & {
      styleProps: StyleProps;
    }
  > &
    (StyleProps extends Record<string, never> ? CssExtension : {});
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
