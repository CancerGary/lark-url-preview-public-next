import {
  extractAsyncTask,
  processHandlebars,
} from "@/pages/api/_lib/hbs-engine/process-handlebars";
import dayjs from "dayjs";
import { EventReport } from "@/pages/api/_lib/hbs-engine/event-report";
import { HolidayDataSource } from "@/pages/api/_lib/data-source/holiday";
import { NameDataSource } from "@/pages/api/_lib/data-source/name";

export function assertTpl({
  tpl,
  expectResult,
  currentTimeOverride = dayjs(),
  expectedEventReportKeys,
  unexpectedEventReportKeys,
  selfEmailPrefix,
}: {
  tpl: string;
  expectResult: string;
  selfEmailPrefix?: string;
  currentTimeOverride?: dayjs.Dayjs;
  expectedEventReportKeys?: (keyof EventReport)[];
  unexpectedEventReportKeys?: (keyof EventReport)[];
}) {
  const dataSources = [new HolidayDataSource(), new NameDataSource()];
  let r = processHandlebars({
    templateText: tpl,
    currentTimeOverride,
    selfEmailPrefix,
    dataSources,
  });
  expect(r.result).toBe(expectResult);
  expectedEventReportKeys?.map((i) =>
    expect(`eventReport ${i} ${r.eventReport[i]}`).toBe(
      `eventReport ${i} ${true}`,
    ),
  );
  unexpectedEventReportKeys?.map((i) =>
    expect(`eventReport ${i} ${r.eventReport[i]}`).toBe(
      `eventReport ${i} ${false}`,
    ),
  );
}
function itTplResult(
  tpl: string,
  expectResult: string,
  currentTimeOverride: dayjs.Dayjs,
  expectedEventReportKeys?: (keyof EventReport)[],
) {
  it(tpl, () => {
    assertTpl({
      tpl,
      expectResult,
      currentTimeOverride,
      expectedEventReportKeys,
    });
  });
}

describe("holiday", () => {
  it("holidayIsOffDay", async () => {
    // language=Handlebars
    let tpl = `{{holidayIsOffDay}}`;

    expect(
      processHandlebars({
        templateText: tpl,
        currentTimeOverride: dayjs("2024-02-01 13:00:00"),
        dataSources: [new HolidayDataSource()],
      }).result,
    ).toBe("false");
  });
  it("holidayIsOffDay_complex", async () => {
    // language=Handlebars
    let tpl = `[{{time_now f="HH:mm"}}] {{#if (holidayIsOffDay)~}}
        今天{{~#if (eq (holidayNearDate) (time_now))}}{{holidayNearName}}{{else}}周末{{/if}}
        {{~else~}}
        {{~#if (or (eq (time_now f="d") "0") (eq (time_now f="d") "6"))}}怎么周末还要上班！{{/if~}}
        {{~#if
                (or
                        (gt (time_diff m='to' t=(time_now f="YYYY-MM-DD 10:00:00") f="s") 0)
                        (lt (time_diff m='to' t=(time_now f="YYYY-MM-DD 21:30:00") f="s") 0)
                )~}}
            下班了
            {{~else~}}
            营业中，距离下班还有 {{time_diff m='to' t=(time_now f="YYYY-MM-DD 21:30:00") f="m"}} 分钟
        {{~/if~}}{{/if}}`;
    assertTpl({
      tpl,
      expectResult: "[13:00] 营业中，距离下班还有 510 分钟",
      currentTimeOverride: dayjs("2024-02-01 13:00:00"),
      expectedEventReportKeys: ["hasHbsHelper", "hasHoliday", "hasTime"],
      unexpectedEventReportKeys: ["hasTokenNameShort", "hasTokenName"],
    });

    assertTpl({
      tpl,
      expectResult: "[19:00] 营业中，距离下班还有 150 分钟",
      currentTimeOverride: dayjs("2024-02-01 19:00:00"),
    });

    assertTpl({
      tpl,
      expectResult: "[09:59] 下班了",
      currentTimeOverride: dayjs("2024-02-01 09:59:59"),
    });

    assertTpl({
      tpl,
      expectResult: "[22:00] 下班了",
      currentTimeOverride: dayjs("2024-02-01 22:00:01"),
    });

    assertTpl({
      tpl,
      expectResult: "[19:00] 今天周末",
      currentTimeOverride: dayjs("2024-02-03 19:00:00"),
    });

    assertTpl({
      tpl,
      expectResult: "[19:00] 怎么周末还要上班！营业中，距离下班还有 150 分钟",
      currentTimeOverride: dayjs("2024-02-04 19:00:00"),
    });

    assertTpl({
      tpl,
      expectResult: "[19:00] 今天春节",
      currentTimeOverride: dayjs("2024-02-10 19:00:00"),
    });
  });

  it("holidayNear", () => {
    // language=Handlebars
    let tpl1 = `距离 {{holidayNearName}} 还有 {{time_diff m='to' t=(holidayNearDate) f="d"}} 天`;
    assertTpl({
      tpl: tpl1,
      expectResult: "距离 清明节 还有 2 天",
      currentTimeOverride: dayjs("2024-04-01 19:00:00"),
    });

    assertTpl({
      tpl: tpl1,
      expectResult: "距离 清明节 还有 0 天",
      currentTimeOverride: dayjs("2024-04-05 19:00:00"),
    });

    // language=Handlebars
    let tpl2 = `距离 {{holidayNearName t="2024-06-01"}} 还有 {{time_diff m='to' t=(holidayNearDate t="2024-06-01") f="d"}} 天`;
    assertTpl({
      tpl: tpl2,
      expectResult: "距离 端午节 还有 69 天",
      currentTimeOverride: dayjs("2024-04-01 19:00:00"),
    });
  });
});
describe("process error", () => {
  it("return raw", () => {
    assertTpl({
      tpl: `{{#if}}{{/#}}`,
      expectResult: "{{#if}}{{/#}}",
      currentTimeOverride: dayjs("2020-01-01 08:00:00"),
    });
  });
});

describe("sample", () => {
  itTplResult(
    `现在是北京时间 {{time_now f="YY-MM-DD HH:mm"}} | 字节跳动已经成立了 {{time_diff m="from" t="2012-03-01"}} 天`,
    "现在是北京时间 20-01-01 08:00 | 字节跳动已经成立了 2862 天",
    dayjs("2020-01-01 08:00:00"),
  );

  it("vivo50", () => {
    assertTpl({
      tpl: `今天是{{time_now f="dddd"}}{{#if (eq (time_now f="d") "4")}}，v我50!{{/if}}`,
      expectResult: "今天是星期四，v我50!",
      currentTimeOverride: dayjs("2020-01-02 08:00:00"),
    });
  });

  itTplResult(
    `It's {{time_now f="llll" l="en" tz="America/New_York"}} at New York now`,
    "It's Tue, Dec 31, 2019 7:00 PM at New York now",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `Hi {{name_short}}，现在是北京时间 {{time_now f="YY-MM-DD HH:mm"}}，距离端午节还有 {{time_diff m="to" t="2024-06-08"}} 天，距离国庆还有 {{time_diff m="to" t="2024-10-01"}} 天~`,
    "Hi LarkUser，现在是北京时间 20-01-01 08:00，距离端午节还有 1619 天，距离国庆还有 1734 天~",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `距离 10 点下班还有 {{time_diff m="to" t=(time_now f="YYYY-MM-DD 24:00:00" tz="Etc/GMT-10") f="m" tz="Etc/GMT-10"}} 分钟`,
    "距离 10 点下班还有 840 分钟",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `距离 8 点下班还有 {{time_diff m="to" t=(time_now f="YYYY-MM-DD 24:00:00" tz="Etc/GMT-12") f="m" tz="Etc/GMT-12"}} 分钟`,
    "距离 8 点下班还有 720 分钟",
    dayjs("2020-01-01 08:00:00"),
  );
});

describe("time", () => {
  itTplResult("{{time_now}}", "2020-01-01", dayjs("2020-01-01 08:00:00"), [
    "hasTime",
  ]);
  itTplResult(
    "{{time_now f='YYYY-MM-DD HH:mm:ss'}}",
    "2020-01-01 08:00:00",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    "{{time_now tz='America/Toronto'}}",
    "2019-12-31",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    "{{time_now f='YYYY-MM-DD HH:mm:ss' tz='America/Toronto'}}",
    "2019-12-31 19:00:00",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    "{{time_now f='YYYY-MM-DD HH:mm:ss' tz='ASS'}}",
    "RangeError: Invalid time zone specified: ASS",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult("{{time_diff}}", "2862", dayjs("2020-01-01 08:00:00"));
  itTplResult(
    "{{time_diff m='from' t='2013-03-01'}}",
    "2497",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    "{{time_diff m='from' t='2013-03-01' f='y'}}",
    "6",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    "{{time_diff m='from' t='bad' f='y'}}",
    "RangeError: Invalid time value",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(`{{time_now f="'"}}`, "'", dayjs("2020-01-01 08:00:00"));

  itTplResult(
    `{{time_relative t="2020-01-01 21:00"}}`,
    "13 小时",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2020-01-02 21:00"}}`,
    "2 天",
    dayjs("2020-01-01 08:00:00"),
  );

  // i18n
  itTplResult(
    `{{time_relative t="2024-06-10 21:00"}}`,
    "4 年",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2024-06-10 21:00" s=true}}`,
    "4 年后",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2024-06-10 21:00" l="en"}}`,
    "4 years",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2024-06-10 21:00" s=true l="en"}}`,
    "in 4 years",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `{{time_relative t="2019-12-31 21:00"}}`,
    "11 小时",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2019-12-31 21:00" s=true}}`,
    "11 小时前",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2019-12-31 21:00" l="en"}}`,
    "11 hours",
    dayjs("2020-01-01 08:00:00"),
  );
  itTplResult(
    `{{time_relative t="2019-12-31 21:00" s=true l="en"}}`,
    "11 hours ago",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `{{time_relative t="bad"}}`,
    "RangeError: Invalid time value",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `{{time_format t="2021-03-04 05:06:07"}}`,
    "2021-03-04",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `{{time_format t="2021-03-04 05:06:07" f="HH:mm:ss YYYY/MM/DD"}}`,
    "05:06:07 2021/03/04",
    dayjs("2020-01-01 08:00:00"),
  );

  itTplResult(
    `{{time_format t="bad"}}`,
    "RangeError: Invalid time value",
    dayjs("2020-01-01 08:00:00"),
  );
});

describe("stress test", () => {
  it("stack not crash", () => {
    let payload = `{{#if 1~}}2{{~/if}}`;
    for (let i = 0; i < 100; i++) {
      payload = payload.replace("2", "{{#if (not (eq 1 (1)))~}}2{{~/if}}");
    }
    for (let i = 0; i < 100; i++) {
      // console.error("run:", i);

      let templateText = `{{!-- ${i} --}}` + payload;
      let ret = processHandlebars({
        templateText: templateText,
        currentTimeOverride: dayjs.tz("2024-05-27", "Asia/Shanghai"),
      });
      expect(ret.result).toBe("2");
      if (i === 0) console.log(ret);
    }
  });
});

describe("helpers", () => {
  describe("comparison", () => {
    it("add", () => {
      assertTpl({
        tpl: `{{lt 1 3}}`,
        expectResult: `true`,
        currentTimeOverride: dayjs(),
      });
    });
  });

  describe("math", () => {
    it("add", () => {
      assertTpl({
        tpl: `{{add 1 "2"}}`,
        expectResult: `3`,
        currentTimeOverride: dayjs(),
      });
    });
  });

  describe("array", () => {
    it("join + split", () => {
      assertTpl({
        // language=Handlebars
        tpl: `{{join (split "a,b,c" ",") "+"}}`,
        expectResult: `a+b+c`,
        currentTimeOverride: dayjs(),
      });
    });
  });
});
