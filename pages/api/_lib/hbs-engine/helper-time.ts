import dayjs, { OpUnitType, QUnitType } from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

import {
  extractCurrentDayjs,
  extractTimezoneFromHbsOptions,
} from "@/pages/api/_lib/hbs-engine/utils";

import("dayjs/locale/en");
import("dayjs/locale/zh");
import("dayjs/locale/ja");

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export function helperTimeDiff(options?: any) {
  // console.log("helperTimeDiff", options);
  // {{time_diff m='from' t='2012-03-01' f='s' tz='America/Toronto'}}
  const {
    m: diffMode,
    t: targetTime,
    f: diffFormat,
  } = (options?.hash ?? {}) as {
    /**
     * 相对现在 计算模式 target from/to now
     */
    m?: unknown;
    /**
     * 目标时间
     */
    t?: unknown;
    /**
     * 格式 https://day.js.org/docs/en/display/difference#list-of-all-available-units
     */
    f?: unknown;
  };
  const tz = extractTimezoneFromHbsOptions(options);
  try {
    const finalMode =
      typeof diffMode === "string" && ["from", "to"].includes(diffMode)
        ? diffMode
        : "from";
    const finalTarget = dayjs.tz(String(targetTime ?? "2012-03-01"), tz);

    const finalDiffFormat = (
      typeof diffFormat === "string" ? diffFormat : "d"
    ) as QUnitType | OpUnitType;

    return finalMode === "from"
      ? extractCurrentDayjs(options).diff(finalTarget, finalDiffFormat)
      : finalTarget.diff(extractCurrentDayjs(options), finalDiffFormat);
  } catch (e) {
    return String(e);
  }
}

export function helperTimeRelative(options?: any) {
  const {
    t: targetTime,
    s: suffix,
    l,
  } = (options?.hash ?? {}) as {
    /**
     * 目标时间
     */
    t?: unknown;
    /**
     * suffix
     */
    s?: unknown;
    /**
     * 语言
     */
    l?: unknown;
  };
  const tz = extractTimezoneFromHbsOptions(options);
  try {
    const finalTarget = dayjs.tz(String(targetTime ?? "2012-03-01"), tz);

    let now = extractCurrentDayjs(options).locale(
      typeof l === "string" && ["en", "zh", "ja"].includes(l) ? l : "zh",
    );
    return now.to(finalTarget, !Boolean(suffix));
  } catch (e) {
    return String(e);
  }
}

export function helperTimeNow(options?: any) {
  //{{time_now f='YYYY-MM-DD' tz='ASS'}}~
  const { f: format, l } = (options?.hash ?? {}) as {
    /**
     * 格式 https://day.js.org/docs/en/display/format#list-of-all-available-formats
     */
    f?: unknown;
    /**
     * 语言
     */
    l?: unknown;
  };
  // console.log("helperTimeNow", options);
  const tz = extractTimezoneFromHbsOptions(options);

  try {
    let now = extractCurrentDayjs(options)
      .tz(tz)
      .locale(
        typeof l === "string" && ["en", "zh", "ja"].includes(l) ? l : "zh",
      );

    return typeof format === "string"
      ? now.format(format)
      : now.format("YYYY-MM-DD");
  } catch (e) {
    return String(e);
  }
}

export function helperTimeFormat(options?: any) {
  //{{time_now f='YYYY-MM-DD' tz='ASS'}}~
  const {
    t: targetTime,
    f: format,
    l,
  } = (options?.hash ?? {}) as {
    /**
     * 目标时间
     */
    t?: unknown;

    /**
     * 格式 https://day.js.org/docs/en/display/format#list-of-all-available-formats
     */
    f?: unknown;
    /**
     * 语言
     */
    l?: unknown;
  };
  // console.log("helperTimeNow", options);
  const tz = extractTimezoneFromHbsOptions(options);

  try {
    const finalTarget = dayjs
      .tz(String(targetTime ?? "2012-03-01"), tz)
      .locale(
        typeof l === "string" && ["en", "zh", "ja"].includes(l) ? l : "zh",
      );

    return typeof format === "string"
      ? finalTarget.format(format)
      : finalTarget.format("YYYY-MM-DD");
  } catch (e) {
    return String(e);
  }
}

const i18nDict = {
  zh_cn: "", // 简体中文
  en_us: "", // 英文
  zh_hk: "", // 繁体中文（香港）
  zh_tw: "", // 繁体中文（台湾）
  ja_jp: "", // 日语
  id_id: "", // 印尼语
  vi_vn: "", // 越南语
  th_th: "", // 泰语
  pt_br: "", // 葡萄牙语
  es_es: "", // 西班牙语
  ko_kr: "", // 韩语
  de_de: "", // 德语
  fr_fr: "", // 法语
  it_it: "", // 意大利语
  ru_ru: "", // 俄语
  ms_my: "", // 马来语
};
export const timeHelpers = {
  time_diff: helperTimeDiff,
  time_now: helperTimeNow,
  time_relative: helperTimeRelative,
  time_format: helperTimeFormat,
};
