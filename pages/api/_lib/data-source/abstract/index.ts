import { UserInfo } from "@/pages/api/_handler/storage";
import { HbsAsyncTask } from "@/pages/api/_lib/hbs-engine/process-handlebars";
import { EventReport } from "@/pages/api/_lib/hbs-engine/event-report";
import dayjs from "dayjs";
export abstract class DataSourceSync<D = unknown> {
  used: boolean = false;
  abstract requirePermission: boolean;

  data: D;

  abstract reportKey: keyof EventReport;
  constructor(defaultData?: D) {
    this.data = defaultData ? defaultData : this.getDefaultData();
  }

  abstract getDefaultData(): D;
  protected abstract getRawHelpers(): WrappedHelpers;

  getHelpers(): WrappedHelpers {
    return helpersReportWrapper(this.getRawHelpers(), () => (this.used = true));
  }

  getHelpersKey(): string[] {
    return Object.keys(this.getHelpers());
  }

  abstract injectHbsRoot(): any;
  getReport(): Partial<EventReport> {
    return {
      [this.reportKey]: this.used,
    };
  }
}

export abstract class DataSource<D = unknown> extends DataSourceSync<D> {
  abstract executeTask({
    hbsAsyncTasks,
    senderInfo,
    currentTimeOverride,
  }: {
    hbsAsyncTasks: HbsAsyncTask[];
    senderInfo: Partial<UserInfo>;
    currentTimeOverride: dayjs.Dayjs;
  }): Promise<D>;
}

export type WrappedHelpers = { [k: string]: Function };

export function helperReportWrapper(
  originalHelper: Function,
  reportCallback: Function,
) {
  return function (this: any) {
    let result = originalHelper.apply(this, arguments);
    reportCallback();
    return result;
  };
}

export function helpersReportWrapper(
  helpers: WrappedHelpers,
  reportCallback: Function,
): WrappedHelpers {
  let result: WrappedHelpers = {};
  for (let key of Object.keys(helpers)) {
    result[key] = helperReportWrapper(helpers[key], reportCallback);
  }
  return result;
}
