import type { Metadata } from 'next';
import { css } from '@style-this/core';

export const metadata: Metadata = {
  title: 'Style This - Next App Router',
  description: 'Example using Next.js App Router with style-this',
};

const GlobalMain = css`
  .Global__Main {
    background: red;
  }
`;

const AppWrapper = css`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div id="app" className={AppWrapper}>
          <div className="content-container">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
