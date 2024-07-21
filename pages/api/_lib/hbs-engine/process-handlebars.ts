import Handlebars from "handlebars";
import { timeHelpers } from "@/pages/api/_lib/hbs-engine/helper-time";
// @ts-ignore
import * as helpersComparison from "handlebars-helpers/lib/comparison";
// @ts-ignore
import * as helpersMath from "handlebars-helpers/lib/math";
// @ts-ignore
import * as helpersArray from "handlebars-helpers/lib/array";
// @ts-ignore
import * as helpersString from "handlebars-helpers/lib/string";

import { DEFAULT_TIMEZONE } from "@/pages/api/_lib/common/consts";
import dayjs from "dayjs";

import {
  isMustacheStatement,
  isNumberLiteral,
  isPathExpression,
  isStringLiteral,
  isSubExpression,
} from "@/pages/api/_lib/hbs-engine/hbs-assert";
import {
  DataSource,
  DataSourceSync,
  helperReportWrapper,
  helpersReportWrapper,
  WrappedHelpers,
} from "@/pages/api/_lib/data-source/abstract";
import {
  createEventReport,
  EventReport,
} from "@/pages/api/_lib/hbs-engine/event-report";
import { AllFieldsNumberOrString } from "@/pages/api/_lib/data-source/abstract/simple-helper";

class ImportScanner extends Handlebars.Visitor {
  partials: HbsAsyncTask[];
  tasks = [] as string[];
  constructor(tasks: string[]) {
    super();
    this.tasks = tasks;
    this.partials = [];
  }

  handle(node: hbs.AST.SubExpression | hbs.AST.MustacheStatement) {
    let methodName = "";

    if (isSubExpression(node)) {
      methodName = node.path.original;
    } else if (isMustacheStatement(node) && isPathExpression(node.path)) {
      methodName = node.path.original;
    }

    if (this.tasks.includes(methodName)) {
      this.partials.push({
        methodName: methodName,
        hash:
          node.hash?.pairs.reduce(
            (acc, cur) => {
              const value = cur.value;
              if (isStringLiteral(value) || isNumberLiteral(value)) {
                const v = value.value;
                acc[cur.key] = v;
              }
              return acc;
            },
            {} as { [k: string]: string | number },
          ) ?? {},
      });
    }

    node.params.map((i) => isSubExpression(i) && this.handle(i));
  }

  SubExpression(sexpr: hbs.AST.SubExpression) {
    return this.handle(sexpr);
  }

  MustacheStatement(mustache: hbs.AST.MustacheStatement) {
    return this.handle(mustache);
  }
}
export interface HbsAsyncTask<
  T extends AllFieldsNumberOrString<T> = {
    [k: string]: number | string | undefined;
  },
> {
  methodName: string;
  hash: T;
}

export function extractAsyncTask({
  templateText,
  dataSources = [],
}: {
  templateText: string;
  dataSources?: DataSource[];
}): {
  result: HbsAsyncTask[];
} {
  let ast = Handlebars.parse(templateText);

  // console.dir(templateText);
  // console.dir(ast, { depth: null });

  let scanner = new ImportScanner(
    dataSources
      ? dataSources.reduce(
          (acc, cur) => [...acc, ...cur.getHelpersKey()],
          [] as string[],
        )
      : [],
  );
  scanner.accept(ast);
  let result = scanner.partials;
  // console.dir(result, { depth: null });

  return {
    result: result,
  };
}

export function processHandlebars({
  templateText,
  fullName = "LarkUser",
  defaultTimezone = DEFAULT_TIMEZONE,
  currentTimeOverride,
  senderUserUnionId,
  selfEmailPrefix,
  demoMode,
  dataSources = [],
}: {
  templateText: string;
  fullName?: string;
  selfEmailPrefix?: string;
  defaultTimezone?: string;
  dataSources?: DataSourceSync[];
  currentTimeOverride: dayjs.Dayjs;
  senderUserUnionId?: string;
  demoMode?: boolean;
}): { result: string; eventReport: EventReport; error?: any } {
  let eventReport: EventReport = createEventReport();
  if (!templateText.includes("{{")) {
    return { result: templateText, eventReport: eventReport };
  }
  try {
    let reportHasTime = () => {
      return (eventReport.hasTime = true);
    };

    let reportHasHbsHelper = () => {
      eventReport.hasHbsHelper = true;
    };

    let hbs = Handlebars.create();
    hbs.registerHelper(helpersComparison);
    hbs.registerHelper(helpersMath);
    hbs.registerHelper(helpersArray);
    hbs.registerHelper(helpersString);

    let helpersInHbs = hbs.helpers;
    for (let k of Object.keys(helpersInHbs)) {
      helpersInHbs[k] = helperReportWrapper(
        helpersInHbs[k],
        reportHasHbsHelper,
      );
    }

    let templateDelegate = hbs.compile(templateText, { noEscape: true });

    let result = templateDelegate({
      ...helpersReportWrapper(timeHelpers, reportHasTime),

      ...dataSources.reduce(
        (acc, cur) => ({ ...acc, ...cur.getHelpers() }),
        {} as WrappedHelpers,
      ),

      ...dataSources.reduce(
        (acc, cur) => ({ ...acc, ...cur.injectHbsRoot() }),
        {} as WrappedHelpers,
      ),

      _defaultTimezone: defaultTimezone,
      _currentTime: currentTimeOverride ?? dayjs(),
      _demoMode: demoMode,
      _fullName: fullName,
      selfEmailPrefix: selfEmailPrefix,
    });
    const finalReport = dataSources.reduce(
      (acc, cur) => ({ ...acc, ...cur.getReport() }),
      eventReport,
    );
    return {
      result,
      eventReport: finalReport,
    };
  } catch (e) {
    console.error("processHandlebars", senderUserUnionId, templateText, e);
    return {
      result: templateText,
      eventReport,
      error: e,
    };
  }
}
