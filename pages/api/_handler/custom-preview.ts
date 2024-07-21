import { getUserInfo, UserInfo } from "@/pages/api/_handler/storage";
import { sendEvent } from "@/pages/api/_lib/tea";
import {
  extractHostnameForReport,
  extractTimeFromUrlObj,
} from "@/pages/api/_lib/util";
import { HandleInfoWithObj } from "@/pages/api/_handler/index";
import {
  extractAsyncTask,
  processHandlebars,
} from "@/pages/api/_lib/hbs-engine/process-handlebars";
import { sentryReportError } from "@/pages/api/_lib/report";
import { HolidayDataSource } from "@/pages/api/_lib/data-source/holiday";
import dayjs from "dayjs";

import { decode62, encode62 } from "@/pages/api/_lib/common/base62";
import { NameDataSource } from "@/pages/api/_lib/data-source/name";
import { DataSource } from "@/pages/api/_lib/data-source/abstract";

export async function buildDataSources(
  rawText: string,
  senderUserUnionId: string | undefined,
  currentTimeOverride: dayjs.Dayjs,
) {
  const dataSources: DataSource[] = [
    new HolidayDataSource(),
    new NameDataSource(),
  ];
  const asyncTask = extractAsyncTask({ templateText: rawText, dataSources });

  let hbsAsyncTasks = asyncTask.result;

  let senderInfo: Partial<UserInfo> = {};

  if (hbsAsyncTasks.length) {
    if (senderUserUnionId) {
      const r = await getUserInfo(senderUserUnionId);
      if (r) senderInfo = r;
    }
  }
  await Promise.all(
    dataSources.map((i) =>
      i.executeTask({
        hbsAsyncTasks: hbsAsyncTasks.filter((t) =>
          i.getHelpersKey().includes(t.methodName),
        ),
        senderInfo,
        currentTimeOverride,
      }),
    ),
  );
  return { dataSources, senderInfo };
}

export async function handleCustomLinkFromParams(info: HandleInfoWithObj) {
  const {
    urlObj,
    operatorUserUnionId,
    senderUserUnionId,
    senderType,
    senderAppId,
    observerUserUnionId,
    isInSign,
    isObservingSelf,
    previewToken,
    openChatId,
    appId,
  } = info;

  let bioExpand = urlObj.searchParams.get("be") ?? "";
  if (bioExpand && !isInSign) {
    return {
      inline: {
        title: "\u200b",
        image_key: bioExpandLinkIcon,
      },
    };
  }

  let rawImageKey = urlObj.searchParams.get("k");
  let u = urlObj.searchParams.get("u");
  let rawText = urlObj.searchParams.get("t") ?? "";
  const t2 = urlObj.searchParams.get("t2");

  try {
    if (t2) rawText = decode62(t2);
  } catch (e) {}
  let cp = urlObj.searchParams.get("cp") ?? "";

  let { currentTimeOverride, defaultTimezone } = extractTimeFromUrlObj(urlObj);

  // 触发异步加载逻辑
  let hasName = rawText.includes("{{name");

  let enableName = false;
  let fullName = "LarkUser";

  if (hasName) {
    const updateName = (val: string) => {
      fullName = val;
      enableName = true;
    };

    // 双向检查
    if (operatorUserUnionId) {
      try {
        const operatorInfo = await getUserInfo(operatorUserUnionId);
        // console.log("operatorInfo", operatorUserUnionId, operatorInfo);
        if (operatorInfo?.name) {
          // app 单独处理
          if (senderType === "app") {
            updateName(operatorInfo?.name);
          } else if (senderUserUnionId) {
            const senderInfo = await getUserInfo(senderUserUnionId);
            if (senderInfo?.name) {
              updateName(operatorInfo?.name);
            }
          }
        }
      } catch (e) {
        console.error(
          "hasName error",
          senderUserUnionId,
          operatorUserUnionId,
          urlObj.toString(),
          e,
        );
        sentryReportError(e, {
          extra: {
            senderUserUnionId,
            operatorUserUnionId,
            url: urlObj.toString(),
          },
        });
      }
    }
  }

  // TODO: 图片和 URL 也支持不同 dataSources
  let { dataSources, senderInfo } = await buildDataSources(
    rawText,
    senderUserUnionId,
    currentTimeOverride,
  );

  let {
    result: textResult,
    eventReport,
    error: textError,
  } = processHandlebars({
    templateText: rawText,
    fullName: fullName,
    defaultTimezone: defaultTimezone,
    currentTimeOverride: currentTimeOverride,
    senderUserUnionId: senderUserUnionId,
    dataSources,
    selfEmailPrefix: senderInfo?.emailPrefix,
  });
  if (textError)
    sentryReportError(textError, {
      extra: {
        senderUserUnionId,
        rawText,
      },
    });

  let {
    result: imgResult,
    eventReport: imgEventReport,
    error: imgError,
  } = processHandlebars({
    templateText: rawImageKey ?? "",
    fullName: fullName,
    defaultTimezone: defaultTimezone,
    currentTimeOverride: currentTimeOverride,
    senderUserUnionId: senderUserUnionId,
    dataSources, // TODO: 补充图片的 dataSources 测试
    selfEmailPrefix: senderInfo?.emailPrefix,
  });
  if (imgError)
    sentryReportError(imgError, {
      extra: {
        senderUserUnionId,
        rawText,
      },
    });

  sendEvent({
    uid: operatorUserUnionId,
    name: "handle_custom_link",
    params: {
      has_token_name:
        eventReport.hasTokenName || imgEventReport.hasTokenName || hasName,
      has_token_time: eventReport.hasTime || imgEventReport.hasTime,
      has_token_name_short:
        eventReport.hasTokenNameShort || imgEventReport.hasTokenNameShort,
      has_token_name_last:
        eventReport.hasTokenNameLast || imgEventReport.hasTokenNameLast,
      has_token_holiday: eventReport.hasHoliday || imgEventReport.hasHoliday,
      has_hbs_helper: eventReport.hasHbsHelper || imgEventReport.hasHbsHelper,
      has_enable_name: enableName,

      has_text: Boolean(rawText),
      has_url: Boolean(u),
      has_cp: Boolean(cp),
      has_bio_expand: Boolean(bioExpand),
      has_text_2: Boolean(t2),

      image_key: String(imgResult),
      hostname: urlObj.hostname,

      sender_type: senderType,
      sender_app_id: senderAppId,
      sender_user_union_id: senderUserUnionId,
      operator_user_union_id: operatorUserUnionId,
      observer_user_union_id: observerUserUnionId,
      target_hostname: extractHostnameForReport(u),
      is_in_sign: Boolean(isInSign),
      is_observing_self: Boolean(isObservingSelf),
      preview_token: previewToken,
      open_chat_id: openChatId,
      lark_app_id: appId,
    },
  });

  return {
    inline: {
      title: textResult ? textResult : "\u200b",
      image_key: imgResult ? imgResult : defaultLinkIcon, //链接预览的前缀图标
      ...(cp
        ? {
            url: {
              copy_url: cp,
            },
          }
        : {}),
    },
  };
}
export const defaultLinkIcon =
  "img_v3_02bj_a88d6829-365b-4bec-a574-5733ba95cc7g";
export const atIcon = "img_v3_02b4_7d920256-21e4-4801-88c7-4dc2cb3c8a5g";

const bioExpandLinkIcon = "img_v3_02bk_fe597478-ab8e-491f-8864-4a9de460b82g";
