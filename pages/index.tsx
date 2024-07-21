import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { sendEvent } from "./api/_lib/tea";
import { extractHostnameForReport } from "./api/_lib/util";
import { renderRedirectUrl } from "@/pages/api/_lib/render-redirect-url";

export default function Home() {
  /* c8 ignore next */
  return null;
  /* c8 ignore next */
}

export function getHostname(context: GetServerSidePropsContext) {
  let xFwdHost = context.req.headers["x-forwarded-host"];
  if (Array.isArray(xFwdHost)) {
    /* c8 ignore next */
    xFwdHost = xFwdHost[0];
    /* c8 ignore next */
  }

  let hostnameWithPort = xFwdHost || context.req.headers.host || "";
  let hostname = hostnameWithPort.split(":")[0];
  return { hostname };
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let rawUrlParams = context.query["u"];
  let { hostname } = getHostname(context);

  let newVar = await renderRedirectUrl(rawUrlParams);

  sendEvent({
    name: "index_page_visit",
    params: {
      hostname: hostname,
      has_token_name: Boolean(context.query["t"]?.includes("{{name}}")),
      has_text: Boolean(context.query["t"]),
      has_url: Boolean(context.query["u"]),
      image_key: String(context.query["k"]),
      target_hostname: extractHostnameForReport(
        typeof rawUrlParams === "string" ? rawUrlParams : "",
      ),

      has_hbs_helper: newVar.eventReport.hasHbsHelper,
    },
  });

  return {
    redirect: {
      destination: newVar.urlResult,
      permanent: false,
    },
  };
  // Normal page rendering if no redirect is needed
  // return {
  //   props: {}, // Pass your normal props here
  // };
};
