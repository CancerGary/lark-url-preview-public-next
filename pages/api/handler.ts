import { handleUrl } from "@/pages/api/_handler";
import { NextApiRequest, NextApiResponse } from "next";
import * as lark from "@larksuiteoapi/node-sdk";
import { sendEvent } from "@/pages/api/_lib/tea";
import {
  LARK_ENCRYPT_KEY,
  LARK_VERIFICATION_TOKEN,
} from "@/pages/api/_lib/config";
import { inspect } from "node:util";
import { PreviewCallback } from "@/pages/api/types";

import crypto from "crypto";
import { sentryReportError } from "@/pages/api/_lib/report";

class AESCipher {
  key: Buffer;

  constructor(key: string) {
    const hash = crypto.createHash("sha256");
    hash.update(key);
    this.key = hash.digest();
  }
  decrypt(encrypt: string) {
    const encryptBuffer = Buffer.from(encrypt, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.key,
      encryptBuffer.slice(0, 16),
    );
    let decrypted = decipher.update(
      encryptBuffer.slice(16).toString("hex"),
      "hex",
      "utf8",
    );
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}

function handle(encrypt: string): { result?: PreviewCallback } {
  for (let key of LARK_ENCRYPT_KEY) {
    try {
      const cipher = new AESCipher(key);
      let result = JSON.parse(cipher.decrypt(encrypt));
      return { result };
    } catch (error) {
      process.env.NODE_ENV === "development" &&
        console.log("handle error", error);
    }
  }
  return {};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // console.log("callback", req.method, req.body);
  let body = req.body as PreviewCallback;
  if (process.env.NODE_ENV === "development") {
    console.log(body);
  }
  if (body?.encrypt) {
    let { result } = handle(body.encrypt);
    if (result) {
      body = result;
    } else {
      return res.status(200).json({});
    }
  }

  if (body?.type === "url_verification") {
    let generateChallenge = lark.generateChallenge(body, {
      encryptKey: "",
    });
    if (process.env.NODE_ENV === "development") {
      console.log(generateChallenge);
    }

    return res.status(200).json(generateChallenge.challenge);
  }

  // let eventVerifyToken = body?.header?.token;
  // if (
  //   process.env.NODE_ENV === "production" &&
  //   (!eventVerifyToken || !LARK_VERIFICATION_TOKEN.includes(eventVerifyToken))
  // ) {
  //   return res.status(200).json({});
  // }

  if (body?.header?.event_type === "url.preview.get") {
    let url = body.event?.context?.url;
    if (!url) return res.status(200).json({});

    let senderUserUnionId = body.event?.sender?.id?.union_id;
    let senderAppId = body.event?.sender?.id?.app_id;
    let senderType = body.event?.sender?.type;
    let observerUserUnionId = body.event?.observer?.id?.union_id;
    let operatorUserUnionId = body.event?.operator?.union_id;
    let openChatId = body.event?.context?.open_chat_id;
    let appId = body.header?.app_id;
    let previewToken = body.event?.preview_token;

    const urlObj = new URL(url);

    let isTestFullMode = false;

    // console.log(
    //   "url.preview.get",
    //   url,
    //   isTestFullMode,
    //   {
    //     senderUserUnionId,
    //     senderType,
    //     observerUserUnionId,
    //     operatorUserUnionId,
    //     openChatId,
    //     isTestFullMode,
    //     appId,
    //   },
    //   inspect(body, { showHidden: false, depth: null, colors: true }),
    // );

    const isInSign = !Boolean(openChatId) && Boolean(previewToken);
    const isObservingSelf = senderUserUnionId === observerUserUnionId;

    sendEvent({
      uid: operatorUserUnionId,
      name: "url_preview_get",
      params: {
        hostname: urlObj.hostname,
        full_mode: isTestFullMode,
        sender_user_union_id: senderUserUnionId,
        observer_user_union_id: observerUserUnionId,
        operator_user_union_id: operatorUserUnionId,
        sender_type: senderType,
        sender_app_id: senderAppId,
        is_in_sign: isInSign,
        is_observing_self: isObservingSelf,
        preview_token: previewToken,
        open_chat_id: openChatId,
        lark_app_id: appId,
      },
    });

    try {
      return res.status(200).json(
        await handleUrl({
          url,
          fullMode: isTestFullMode,
          previewToken,
          operatorUserUnionId,
          senderUserUnionId,
          senderType,
          senderAppId,
          observerUserUnionId,
          openChatId,
          isInSign,
          isObservingSelf,
        }),
      );
    } catch (e: any) {
      console.error(body, e);
      sentryReportError(e, { extra: { senderUserUnionId, url } });
      return res
        .status(200)
        .json({ status_code: 400, status_message: e?.message ?? "error" });
    }
  }
  return res.status(200).json({});
}
