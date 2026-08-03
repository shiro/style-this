// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { css } from "@style-this/core";

const AppWrapper = css`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="app" class={AppWrapper}>{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
