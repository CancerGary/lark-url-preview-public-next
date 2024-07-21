import App from "@/lib/App";
import { EDITOR_TITLE } from "@/pages/api/_lib/config";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>{EDITOR_TITLE}</title>
      </Head>
      <App />
    </>
  );
}
