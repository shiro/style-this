import { Component, ComponentProps, JSX } from "solid-js";

// Component.class
type CssExtension = {
  readonly css: string;
};

type TemplateExpression<StyleProps> =
  | string
  | number
  | ((styleProps: StyleProps) => string | number);

type StyledTemplateFn<
  BaseComponent extends Component<any> | keyof JSX.IntrinsicElements,
> = <
  StyleProps extends Record<string, any> & { props?: never } = Record<
    string,
    never
  >,
>(
  s: TemplateStringsArray,
  ...expr: Array<
    TemplateExpression<
      StyleProps &
        ComponentProps<BaseComponent>["styleProps"] & {
          props: Omit<ComponentProps<BaseComponent>, "styleProps">;
        }
    >
  >
) => Component<
  ComponentProps<BaseComponent> &
    (StyleProps extends Record<string, never> ? {} : { styleProps: StyleProps })
> &
  (StyleProps extends Record<string, never> ? CssExtension : {});

type StyledProxy =
  // for styled.div:
  { [Element in keyof JSX.IntrinsicElements]: StyledTemplateFn<Element> } &
    // for styled(BaseComponent) and styled('div'):
    (<P extends { class?: string; props?: never }>(
      baseComponent: Component<P> | keyof JSX.IntrinsicElements,
    ) => StyledTemplateFn<Component<P>>);

export const styled = new Proxy({} as StyledProxy, {
  apply<BaseComponent extends Component<any>>(
    _target: StyledProxy,
    _thisArg: {},
    [baseComponent]: [BaseComponent],
  ): StyledTemplateFn<BaseComponent> {
    return (..._args: any) => {
      throw new Error(
        `@style-this: called 'styled(${String(baseComponent)})' at runtime. This indicates an error in the transform.`,
      );
    };
  },
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
