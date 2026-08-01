import type { ComponentType, CSSProperties, JSX } from "react";

type CssExtension = {
  readonly css: string;
};

type TemplateExpression<StyleProps> =
  | string
  | number
  | ((styleProps: StyleProps) => string | number);

type StyledTemplateFn<
  BaseComponent extends ComponentType<any> | keyof JSX.IntrinsicElements,
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
        (BaseComponent extends ComponentType<infer P> ? P : JSX.IntrinsicElements[BaseComponent & keyof JSX.IntrinsicElements]) & {
          props: BaseComponent extends ComponentType<infer P> ? Omit<P, "styleProps"> : JSX.IntrinsicElements[BaseComponent & keyof JSX.IntrinsicElements];
        }
    >
  >
) => ComponentType<
  (BaseComponent extends ComponentType<infer P> ? P : JSX.IntrinsicElements[BaseComponent & keyof JSX.IntrinsicElements]) &
    (StyleProps extends Record<string, never> ? {} : { styleProps: StyleProps })
> &
  (StyleProps extends Record<string, never> ? CssExtension : {});

type StyledProxy =
  // for styled.div:
  { [Element in keyof JSX.IntrinsicElements]: StyledTemplateFn<Element> } &
    // for styled(BaseComponent) and styled('div'):
    (<P extends { className?: string; style?: CSSProperties; props?: never }>(
      baseComponent: ComponentType<P> | keyof JSX.IntrinsicElements,
    ) => StyledTemplateFn<ComponentType<P>>);

export const styled = new Proxy({} as StyledProxy, {
  apply<BaseComponent extends ComponentType<any>>(
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
