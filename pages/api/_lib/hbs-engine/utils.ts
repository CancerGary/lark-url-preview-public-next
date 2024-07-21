import { DEFAULT_TIMEZONE } from "@/pages/api/_lib/common/consts";
import dayjs from "dayjs";

export function extractTimezoneFromHbsOptions(options: any): string {
  const dtz = options?.data?.root?._defaultTimezone ?? DEFAULT_TIMEZONE;
  let tz = options?.hash?.tz;
  return typeof tz === "string" ? tz : dtz;
}

export function extractIndexFromHbsOptions(options: any): number {
  let i = options?.hash?.i;
  return Number(i ?? 0);
}

export function extractCurrentDayjs(options: any): dayjs.Dayjs {
  return options?.data?.root?._currentTime ?? dayjs();
}

export function isDemoMode(options: any): boolean {
  return options?.data?.root?._demoMode;
}
