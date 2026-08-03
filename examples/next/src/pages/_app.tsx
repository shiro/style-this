import type { AppProps } from 'next/app';
import { css } from '@style-this/core';

// Define global styles that apply to all pages
const _GlobalMain = css`
  .Global__Main {
    background: red;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div id="app" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <div className="content-container">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
