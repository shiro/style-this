import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Example',
  description: 'Example using @style-this/next',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        background: '#f5f5f5',
      }}>{children}</body>
    </html>
  );
}
