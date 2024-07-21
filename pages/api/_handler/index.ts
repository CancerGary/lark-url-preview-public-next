import {
  defaultLinkIcon,
  handleCustomLinkFromParams,
} from "@/pages/api/_handler/custom-preview";
import { EDITOR_TITLE, SITE_TITLE } from "@/pages/api/_lib/config";

export interface HandleUrlInfo {
  url: string;
  appId?: string;
  fullMode?: boolean;
  previewToken?: string;
  operatorUserUnionId?: string;
  senderUserUnionId?: string;
  senderAppId?: string;
  senderType?: string;
  observerUserUnionId?: string;
  openChatId?: string;
  isInSign?: boolean;
  isObservingSelf?: boolean;
}

export type HandleInfoWithObj = HandleUrlInfo & { urlObj: URL };

export async function handleUrl(info: HandleUrlInfo) {
  const { fullMode } = info;
  const info2: HandleInfoWithObj = {
    ...info,
    urlObj: new URL(info.url),
  };
  return await handleSiteUrl(info2);
}

export async function handleSiteUrl(info: HandleInfoWithObj) {
  const { urlObj } = info;

  if (urlObj.pathname === "/editor") {
    return {
      inline: {
        title: `${EDITOR_TITLE}@${urlObj.hostname}`,
        image_key: defaultLinkIcon,
      },
    };
  }

  if (
    urlObj.searchParams.get("k") ||
    urlObj.searchParams.get("t") ||
    urlObj.searchParams.get("t2")
  ) {
    return handleCustomLinkFromParams(info);
  }

  return {
    inline: {
      title: `${SITE_TITLE}@${urlObj.hostname}`,
      image_key: defaultLinkIcon,
    },
  };
}
