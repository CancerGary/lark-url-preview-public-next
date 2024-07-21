import {
  DataSourceSync,
  helperReportWrapper,
  WrappedHelpers,
} from "@/pages/api/_lib/data-source/abstract";
import {
  defaultNameInfo,
  NameInfo,
} from "@/pages/api/_lib/data-source/name/types";
import {
  helperName,
  helperNameLast,
  helperNameShort,
} from "@/pages/api/_lib/data-source/name/helpers";
import { EventReport } from "@/pages/api/_lib/hbs-engine/event-report";
export class NameDataSourceSync extends DataSourceSync<NameInfo> {
  reportKey = "hasTokenName" as const;
  requirePermission = true;
  hasTokenName = false;
  hasTokenNameShort = false;
  hasTokenNameLast = false;
  getRawHelpers() {
    return {
      name: helperName,
      name_short: helperNameShort,
      name_last: helperNameLast,
    };
  }

  getHelpers(): WrappedHelpers {
    return {
      name: helperReportWrapper(helperName, () => {
        this.hasTokenName = true;
        this.used = true;
      }),
      name_short: helperReportWrapper(helperNameShort, () => {
        this.hasTokenNameShort = true;
        this.used = true;
      }),
      name_last: helperReportWrapper(helperNameLast, () => {
        this.hasTokenNameLast = true;
        this.used = true;
      }),
    };
  }

  getDefaultData(): NameInfo {
    return defaultNameInfo;
  }

  injectHbsRoot() {
    return {
      _NameInfo: this.data,
    };
  }

  getReport(): Partial<EventReport> {
    return {
      hasTokenName: this.hasTokenName,
      hasTokenNameShort: this.hasTokenNameShort,
      hasTokenNameLast: this.hasTokenNameLast,
    };
  }
}
