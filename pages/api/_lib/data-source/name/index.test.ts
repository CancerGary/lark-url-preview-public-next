import { NameDataSource } from "@/pages/api/_lib/data-source/name/index";
import { processHandlebars } from "@/pages/api/_lib/hbs-engine/process-handlebars";
import dayjs from "dayjs";

describe("name", () => {
  it("{{name}}", () => {
    let r = processHandlebars({
      templateText: "{{name}}",
      fullName: "飞小书",
      currentTimeOverride: dayjs(),
      dataSources: [new NameDataSource()],
    });
    expect(r.result).toBe("飞小书");
    expect(r.eventReport.hasTokenName).toBe(true);
    expect(r.eventReport.hasTokenNameShort).toBe(false);
    expect(r.eventReport.hasTokenNameLast).toBe(false);
  });
  it("{{name_short}}", () => {
    let r = processHandlebars({
      templateText: "{{name_short}}",
      fullName: "飞小书",
      currentTimeOverride: dayjs(),
      dataSources: [new NameDataSource()],
    });
    expect(r.result).toBe("小书");
    expect(r.eventReport.hasTokenName).toBe(false);
    expect(r.eventReport.hasTokenNameShort).toBe(true);
    expect(r.eventReport.hasTokenNameLast).toBe(false);
  });
  it("{{name_last}}", () => {
    let r = processHandlebars({
      templateText: "{{name_last}}",
      fullName: "飞小书",
      currentTimeOverride: dayjs(),
      dataSources: [new NameDataSource()],
    });
    expect(r.result).toBe("飞");
    expect(r.eventReport.hasTokenName).toBe(false);
    expect(r.eventReport.hasTokenNameShort).toBe(false);
    expect(r.eventReport.hasTokenNameLast).toBe(true);
  });
});
