import { DEFAULT_TIMEZONE } from "@/pages/api/_lib/common/consts";
import dayjs from "dayjs";

export function extractHostnameForReport(url?: string | null) {
  let targetHostname = "";
  try {
    const uObj = new URL(url ?? "");
    targetHostname = uObj.hostname;
  } catch (e) {}

  return targetHostname;
}

export function extractTimeFromUrlObj(urlObj: URL) {
  let defaultTimezone = urlObj.searchParams.get("dtz") || DEFAULT_TIMEZONE;
  let dbg_ct = urlObj.searchParams.get("dbg_ct") ?? "";

  let currentTimeOverride = dayjs().tz(DEFAULT_TIMEZONE);
  try {
    if (dbg_ct) {
      currentTimeOverride = dayjs.tz(dbg_ct, defaultTimezone);
    }
  } catch (e) {
    // pass
  }
  return { currentTimeOverride, defaultTimezone };
}
