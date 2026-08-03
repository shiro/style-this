import type { AppProps } from 'next/app';
import { css } from '@style-this/core';

// Define global styles that apply to all pages
const _GlobalMain = css`
  .Global__Main {
    background: red;
  }
`;

const AppWrapper = css`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div id="app" className={AppWrapper}>
      <div className="content-container">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
