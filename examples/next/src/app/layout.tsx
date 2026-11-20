import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app.css";
import "@style-this/core/atomic";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Example",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
