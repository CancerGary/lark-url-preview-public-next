import { extractTimeFromUrlObj } from "@/pages/api/_lib/util";
import {
  extractAsyncTask,
  processHandlebars,
} from "@/pages/api/_lib/hbs-engine/process-handlebars";
import { createEventReport } from "@/pages/api/_lib/hbs-engine/event-report";
import { HolidayDataSource } from "@/pages/api/_lib/data-source/holiday";
import dayjs from "dayjs";
import { DataSource } from "@/pages/api/_lib/data-source/abstract";
import { ICON_DOCX } from "@/pages/api/_lib/config";

export async function processUrlHbs({
  rawUrlParams,
  defaultTimezone,
  currentTimeOverride,
}: {
  rawUrlParams: string;
  defaultTimezone?: string;
  currentTimeOverride: dayjs.Dayjs;
}) {
  const dataSources: DataSource[] = [new HolidayDataSource()];
  const asyncTask = extractAsyncTask({
    templateText: rawUrlParams,
    dataSources,
  });
  await Promise.all(
    dataSources.map((i) =>
      i.executeTask({
        hbsAsyncTasks: asyncTask.result,
        senderInfo: {},
        currentTimeOverride: dayjs(),
      }),
    ),
  );
  let {
    result: urlResult,
    eventReport,
    error: urlError,
  } = processHandlebars({
    templateText: rawUrlParams,
    defaultTimezone: defaultTimezone,
    currentTimeOverride: currentTimeOverride,
    dataSources,
  });
  return { urlResult, eventReport };
}

export async function renderRedirectUrl(
  rawUrlParams: string | string[] | undefined,
) {
  if (typeof rawUrlParams === "string" && rawUrlParams.length > 0) {
    let urlObj: URL | undefined;
    try {
      urlObj = new URL(rawUrlParams);
    } catch (e) {}
    if (urlObj) {
      const { defaultTimezone, currentTimeOverride } =
        extractTimeFromUrlObj(urlObj);
      let { urlResult, eventReport } = await processUrlHbs({
        rawUrlParams,
        defaultTimezone,
        currentTimeOverride,
      });

      return {
        urlResult: encodeURI(urlResult),
        eventReport,
      };
    }
  }

  return {
    urlResult: ICON_DOCX,
    eventReport: createEventReport(),
  };
}
