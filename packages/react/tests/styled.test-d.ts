import { expectTypeOf, test } from "vitest";
import { styled } from "../src/index";

test("style functions get the style props, and the component's props in `props`", () => {
  const Button = styled.button<{ size: number }>`
    padding: ${(styleProps) => {
      expectTypeOf(styleProps.size).toEqualTypeOf<number>();
      expectTypeOf(styleProps.props.disabled).toEqualTypeOf<boolean | undefined>();
      // @ts-expect-error the component's props are only in `props`
      void styleProps.disabled;
      // @ts-expect-error React doesn't pass these in the props
      void styleProps.props.ref;
      // @ts-expect-error
      void styleProps.props.key;
      return styleProps.size;
    }}px;
  `;

  styled(Button)<{ color: string }>`
    color: ${(styleProps) => {
      // the base component's style props are part of the style props
      expectTypeOf(styleProps.size).toEqualTypeOf<number>();
      return styleProps.color;
    }};
  `;
});

test("`props` keeps the members of union props apart", () => {
  const Base = (
    _props: { className?: string } & (
      | { kind: "a"; a: string }
      | { kind: "b"; b: number }
    ),
  ) => null;

  styled(Base)`
    color: ${({ props }) => {
      expectTypeOf(props.kind).toEqualTypeOf<"a" | "b">();
      return props.kind === "a" ? props.a : props.b;
    }};
  `;
});
