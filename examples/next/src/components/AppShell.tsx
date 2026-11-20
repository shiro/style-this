import { css } from "@style-this/core";
import type { ReactNode } from "react";

const AppWrapper = css`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div id="app" className={AppWrapper}>
      <div className="content-container">{children}</div>
    </div>
  );
}
