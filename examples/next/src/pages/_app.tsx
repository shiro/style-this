import type { AppProps } from "next/app";
import Head from "next/head";
import "@/app.css";
import "@style-this/core/atomic";
import AppShell from "@/components/AppShell";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppShell>
      <Head>
        <title>Example</title>
      </Head>
      <Component {...pageProps} />
    </AppShell>
  );
}
