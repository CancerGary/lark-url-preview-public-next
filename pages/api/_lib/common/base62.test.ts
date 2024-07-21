import { decode62, encode62 } from "@/pages/api/_lib/common/base62";

describe("base62", () => {
  it("encode", () => {
    expect(encode62("你好")).toBe("19PqtKE1t");
  });

  it("decode", () => {
    expect(decode62("19PqtKE1t")).toBe("你好");
  });
});
