import {
  DataSource,
  DataSourceSync,
  helpersReportWrapper,
  WrappedHelpers,
} from "@/pages/api/_lib/data-source/abstract/index";
import { HbsAsyncTask } from "@/pages/api/_lib/hbs-engine/process-handlebars";
import { UserInfo } from "@/pages/api/_handler/storage";
import dayjs from "dayjs";
import lodash from "lodash";

export const FAILED_REASON_TIMEOUT = "(timeout)";
export const FAILED_REASON_NO_PERMISSION = "(no permission)";

type NumberOrString = number | string | undefined;

// 这里使用了映射类型结合条件类型来确保所有属性都是 number | string 类型
export type AllFieldsNumberOrString<T> = {
  [K in keyof T]: T[K] extends NumberOrString ? T[K] : never;
};

type DataForHbsGlobal<Params extends AllFieldsNumberOrString<Params>, R> = {
  data: { params: Params; result: R }[];
  fetchFailedReason: string;
};

export abstract class DataSourceSimpleHelperSync<
  Params extends AllFieldsNumberOrString<Params>,
  Result = unknown,
> extends DataSourceSync<DataForHbsGlobal<Params, Result>> {
  getDefaultData(): DataForHbsGlobal<Params, Result> {
    return {
      data: [],
      fetchFailedReason: FAILED_REASON_NO_PERMISSION,
    };
  }

  getRawHelpers(): WrappedHelpers {
    return {
      [this.helperName]: this.helper.bind(this),
    };
  }

  private helper(options: any) {
    const found = this.data.data.find((i) => {
      return lodash.isEqual(options.hash, i.params);
    });

    return this.helperBody({
      result: found?.result,
      params: options.hash,
      fetchFailedReason: this.data.fetchFailedReason,
      options,
    });
  }
  injectHbsRoot(): any {
    return {
      [this.getInjectName()]: this.data,
    };
  }

  private getInjectName() {
    return `_${this.helperName}Info`;
  }

  abstract helperBody(props: {
    params: Params;
    result?: Result;
    fetchFailedReason: string;
    options: any;
  }): any;

  abstract helperName: string;
}

export abstract class DataSourceSimpleHelper<
  Params extends AllFieldsNumberOrString<Params>,
  R = unknown,
> extends DataSource<DataForHbsGlobal<Params, R>> {
  abstract executeHelperTask({
    params,
    senderInfo,
    currentTimeOverride,
  }: {
    params: Params;
    senderInfo: Partial<UserInfo>;
    currentTimeOverride: dayjs.Dayjs;
  }): Promise<R>;

  abstract checkHasPermission({
    senderInfo,
  }: {
    senderInfo: Partial<UserInfo>;
  }): boolean;

  abstract executeTask({
    hbsAsyncTasks,
    senderInfo,
    currentTimeOverride,
  }: {
    hbsAsyncTasks: HbsAsyncTask<Params>[];
    senderInfo: Partial<UserInfo>;
    currentTimeOverride: dayjs.Dayjs;
  }): Promise<DataForHbsGlobal<Params, R>>;
}

export async function executeSingleHelperTask<
  Params extends AllFieldsNumberOrString<Params>,
  R = unknown,
>(
  dsSelf: DataSourceSimpleHelper<Params, R>,
  {
    hbsAsyncTasks,
    senderInfo,
    currentTimeOverride,
  }: {
    hbsAsyncTasks: HbsAsyncTask<Params>[];
    senderInfo: Partial<UserInfo>;
    currentTimeOverride: dayjs.Dayjs;
  },
): Promise<DataForHbsGlobal<Params, R>> {
  if (dsSelf.checkHasPermission({ senderInfo })) {
    const resp = await Promise.race([
      Promise.all(
        hbsAsyncTasks
          .filter((i) => dsSelf.getHelpersKey().includes(i.methodName))
          .map(async (i) => {
            return {
              params: i.hash,
              result: await dsSelf.executeHelperTask({
                params: i.hash,
                currentTimeOverride,
                senderInfo,
              }),
            };
          }),
      ),
      (process.env.NODE_ENV !== "test"
        ? sleep(2000)
        : new Promise(() => {})
      ).then(() => undefined),
    ]);
    if (resp) {
      dsSelf.data = { data: resp, fetchFailedReason: "" };
    } else {
      dsSelf.data = {
        fetchFailedReason: FAILED_REASON_TIMEOUT,
        data: [],
      };
    }
    return dsSelf.data;
  }

  return dsSelf.data;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
