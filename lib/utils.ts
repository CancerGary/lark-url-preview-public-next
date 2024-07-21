import queryString from "query-string";
import { encode62 } from "@/pages/api/_lib/common/base62";

export function buildImgKeyUrl(imgKey: string) {
  return imgKey
    ? `https://open.feishu.cn/open-apis/block-kit/image/${imgKey}`
    : "";
}

export function buildCustomPreviewUrl({
  imgKey,
  text,
  url,
  bioExpand,
  useTestDomain,
}: {
  imgKey: string;
  text: string;
  url: string;
  bioExpand?: boolean;
  useTestDomain?: boolean;
}) {
  let DOMAIN = "https://l.garyyang.work/";
  const stringified = queryString.stringify(
    {
      k: imgKey,
      t2: encode62(text),
      u: url,
      be: bioExpand ? "1" : undefined,
    },
    { strict: true, skipEmptyString: true },
  );

  return `${DOMAIN}?${stringified}`;
}
