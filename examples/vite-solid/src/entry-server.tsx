// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { config } from "~/config";
import { css } from "@style-this/core";

const _warn = console.warn;
console.warn = function (message?: any, ...optionalParams: any[]) {
  if (message == "No route matched for preloading js assets") return;
  _warn(message, ...optionalParams);
};

const filterAssets = (input: any): any => {
  if (Array.isArray(input)) return input.map(filterAssets).filter(Boolean);
  if (input.t.startsWith("<style")) return null;
  return input;
};

const AppWrapper = css`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export default createHandler(() => {
  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en" class="theme-dark">
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <link rel="icon" href={`${config.base}/favicon.ico`} />
            {filterAssets(assets)}
            {/* {assets} */}
          </head>
          <body>
            <div id="app" class={AppWrapper}>
              {children}
            </div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
