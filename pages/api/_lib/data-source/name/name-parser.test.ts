import {
  getLarkUserLastName,
  getLarkUserShorterName,
} from "@/pages/api/_lib/data-source/name/name-parser";

describe("name parser", () => {
  describe("更短的名字", () => {
    it("两个字中文，保持两字", () => {
      expect(getLarkUserShorterName("李刚")).toEqual("李刚");
    });

    it("三个字中文，假定姓一个字，返回名的部分", () => {
      expect(getLarkUserShorterName("李狗蛋")).toEqual("狗蛋");
    });

    it("复姓中文", () => {
      expect(getLarkUserShorterName("司马懿")).toEqual("懿");
      expect(getLarkUserShorterName("司马青衫")).toEqual("青衫");
    });

    it("中文+英文名，返回英文名", () => {
      expect(getLarkUserShorterName("李刚aPpLe")).toEqual("aPpLe");
    });
    it("两个单词英文名，返回第一个单词", () => {
      expect(getLarkUserShorterName("Donald Trump")).toEqual("Donald");
    });
    it("其他情况，原样返回", () => {
      expect(getLarkUserShorterName("Test")).toEqual("Test");
    });
  });

  describe("获取姓氏", () => {
    it("两个字中文", () => {
      expect(getLarkUserLastName("李刚")).toEqual("李");
    });

    it("三个字中文，假定姓一个字，返回姓的部分", () => {
      expect(getLarkUserLastName("李狗蛋")).toEqual("李");
    });

    it("复姓中文", () => {
      expect(getLarkUserLastName("司马")).toEqual("司马");
      expect(getLarkUserLastName("司马青衫")).toEqual("司马");
    });

    it("中文+英文名，返回中文姓氏", () => {
      expect(getLarkUserLastName("李刚aPpLe")).toEqual("李");
    });
    it("两个单词英文名，返回第二个单词", () => {
      expect(getLarkUserLastName("Donald Trump")).toEqual("Trump");
    });
    it("其他情况，原样返回", () => {
      expect(getLarkUserLastName("Test")).toEqual("Test");
      expect(getLarkUserLastName("这是个测试")).toEqual("这是个测试");
    });
  });
});
