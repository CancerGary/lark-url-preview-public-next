import { isHoliday } from "@/pages/api/_lib/data-source/holiday/index";
import dayjs from "dayjs";

it("isHoliday", () => {
  const testCase = [
    ["2024-02-01", false],
    ["2024-02-02", false],
    ["2024-02-03", true],
    ["2024-02-04", false],
    ["2024-02-05", false],
    ["2024-02-06", false],
  ] as const;
  testCase.forEach((i) => expect(isHoliday(dayjs(i[0]))).toEqual(i[1]));
});
