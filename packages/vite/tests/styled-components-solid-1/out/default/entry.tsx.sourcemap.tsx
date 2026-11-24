// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-solid-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-solid-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/solid\";\nimport { css } from \"@style-this/core\";\n\n// must not be shadowed by the generated wrapper's props\nconst props = { gap: 4 };\n\nexport const FancyButton = styled.button<{ a: number }>`\n  background: none;\n  border: 1px solid blue;\n  border-radius: 2px;\n  padding: ${({ a }) => a}px;\n  gap: ${() => props.gap}px;\n`;\n\n// must not be shadowed by the generated wrapper's class variable\nconst ui = {\n  accent: \"red\",\n  Card: styled.div`\n    color: ${() => ui.accent};\n  `,\n};\n\nexport default styled.div`\n  color: ${() => ui.accent};\n`;\n\nconst unrelated = css`\n  background: none;\n`;\n\nexport const Link = styled(\"a\")<{ size: number }>`\n  font-size: ${({ size }) => size}px;\n`;\n\nexport const Panel = styled(ui.Card)`\n  border-color: ${() => ui.accent};\n`;\n\n// lowercase and computed bases are components, not HTML elements\nconst card = (p: { class?: string }) => <div class={p.class} />;\nconst components = { Card: card };\n\nexport const LowercaseBase = styled(card)`\n  color: red;\n`;\n\nexport const ComputedBase = styled(components[\"Card\"])`\n  color: ${() => ui.accent};\n`;\n\nexport const TemplateTag = styled(`span`)`\n  color: blue;\n`;\n\n// wrapped and non-arrow functions are runtime style functions too\nexport const StyleFunctions = styled.div<{ size: number }>`\n  width: ${function ({ size }) {\n    return size;\n  }}px;\n  height: ${(({ size }) => size) as (p: { size: number }) => number}px;\n  margin: ${(({ size }) => size) satisfies (p: { size: number }) => number}px;\n  padding: ${(({ size }) => size)!}px;\n`;\n\n// styled components are scoped even with a `_Global` name\nexport const _GlobalBar = styled.div`\n  color: green;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAM2B;;;;;;;AAWnB;;;;AAKO;;;AAIG;;;AAIE;;;AAIC;;;AAQQ;;;AAID;;;AAID;;;AAKG;;;;;;AAUJ"
// }

import { styled } from "@style-this/solid";
import { css } from "@style-this/core";

// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
  gap: ${() => props.gap}px;
`;

// must not be shadowed by the generated wrapper's class variable
const ui = {
  accent: "red",
  Card: styled.div`
    color: ${() => ui.accent};
  `,
};

export default styled.div`
  color: ${() => ui.accent};
`;

const unrelated = css`
  background: none;
`;

export const Link = styled("a")<{ size: number }>`
  font-size: ${({ size }) => size}px;
`;

export const Panel = styled(ui.Card)`
  border-color: ${() => ui.accent};
`;

// lowercase and computed bases are components, not HTML elements
const card = (p: { class?: string }) => <div class={p.class} />;
const components = { Card: card };

export const LowercaseBase = styled(card)`
  color: red;
`;

export const ComputedBase = styled(components["Card"])`
  color: ${() => ui.accent};
`;

export const TemplateTag = styled(`span`)`
  color: blue;
`;

// wrapped and non-arrow functions are runtime style functions too
export const StyleFunctions = styled.div<{ size: number }>`
  width: ${function ({ size }) {
    return size;
  }}px;
  height: ${(({ size }) => size) as (p: { size: number }) => number}px;
  margin: ${(({ size }) => size) satisfies (p: { size: number }) => number}px;
  padding: ${(({ size }) => size)!}px;
`;

// styled components are scoped even with a `_Global` name
export const _GlobalBar = styled.div`
  color: green;
`;
