import type { AppProps } from "next/app";

import "../lib/ud.css";
import "../lib/index.css";
import "../lib/imtoken.css";
import "../lib/special.scss";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
