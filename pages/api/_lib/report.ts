/* c8 ignore start */
import * as Sentry from "@sentry/node";
let isInit = false;
let enabled = process.env.NODE_ENV !== "test";
export function init() {
  // TODO
}

init();

export function sentryReportError(
  exception: any,
  captureContext?: { extra: Record<string, unknown> },
) {
  // TODO
}
