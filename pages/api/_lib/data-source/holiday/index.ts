import dayjs from "dayjs";

import holidayData from "@/pages/api/_lib/data-source/holiday/2024.json";
import {
  extractCurrentDayjs,
  extractTimezoneFromHbsOptions,
} from "@/pages/api/_lib/hbs-engine/utils";

export function isHoliday(dj: dayjs.Dayjs) {
  const formatted = dj.format("YYYY-MM-DD");
  const found = holidayData.days.find((data) => {
    if (data.date === formatted) {
      return true;
    }
  });

  if (found) {
    return found.isOffDay;
  }
  // isweekend
  return dj.day() === 0 || dj.day() === 6;
}

export function getNextHoliday(dj: dayjs.Dayjs) {
  const found = holidayData.days.find((data) => {
    if (data.date >= dj.format("YYYY-MM-DD") && data.isOffDay) {
      return true;
    }
  });
  return found;
}

function extractTimeFromHash(options: any) {
  const { t: targetTime } = (options?.hash ?? {}) as {
    /**
     * 目标时间
     */
    t?: unknown;
  };
  const tz = extractTimezoneFromHbsOptions(options);
  const finalTarget = targetTime
    ? dayjs.tz(String(targetTime), tz)
    : extractCurrentDayjs(options);
  return finalTarget;
}

export function helperIsOffDay(options?: any) {
  return isHoliday(extractTimeFromHash(options));
}

export function helperHolidayNextName(options?: any) {
  return getNextHoliday(extractTimeFromHash(options))?.name;
}

export function helperHolidayNextDate(options?: any) {
  return getNextHoliday(extractTimeFromHash(options))?.date;
}

export const holidayHelpers = {
  holidayIsOffDay: helperIsOffDay,
  holidayNearDate: helperHolidayNextDate,
  holidayNearName: helperHolidayNextName,
};

import {
  DataSource,
  DataSourceSync,
} from "@/pages/api/_lib/data-source/abstract";

export class HolidayDataSourceSync extends DataSourceSync<{}> {
  reportKey = "hasHoliday" as const;
  requirePermission = false;
  getRawHelpers() {
    return holidayHelpers;
  }

  getDefaultData(): {} {
    return {};
  }

  injectHbsRoot() {
    return {};
  }
}

export class HolidayDataSource
  extends HolidayDataSourceSync
  implements DataSource<{}>
{
  executeTask(): Promise<{}> {
    return Promise.resolve({});
  }
}
