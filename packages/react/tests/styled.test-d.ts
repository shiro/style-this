import { expectTypeOf, test } from "vitest";
import { styled } from "../src/index";

test("style functions get the style props, and the component's props in `props`", () => {
  const Button = styled.button<{ size: number }>`
    padding: ${(styleProps) => {
      expectTypeOf(styleProps.size).toEqualTypeOf<number>();
      expectTypeOf(styleProps.props.disabled).toEqualTypeOf<boolean | undefined>();
      // @ts-expect-error the component's props are only in `props`
      void styleProps.disabled;
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
