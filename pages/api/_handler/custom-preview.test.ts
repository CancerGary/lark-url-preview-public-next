import { handleUrl } from "@/pages/api/_handler/index";
import { rdsDisconnect } from "@/pages/api/_lib/redis";
import {
  atIcon,
  defaultLinkIcon as defaultImageKey,
} from "@/pages/api/_handler/custom-preview";

afterAll(() => {
  rdsDisconnect();
});

describe("URL param", () => {
  it("empty", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "自定义飞书链接预览@l.garyyang.work",
      },
    });
  });

  it("editor", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/editor",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "自定义飞书链接预览编辑器@l.garyyang.work",
      },
    });
  });

  it("t param", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=123",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "123",
      },
    });
  });

  it("t2 param", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t2=19PqtKE1t",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "你好",
      },
    });
  });

  it("k param", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?k=123",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: "123",
        title: "\u200b",
      },
    });
  });

  it("t & k param", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?k=999&t=888",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: "999",
        title: "888",
      },
    });
  });

  it("bio_expand", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?k=999&t=888&be=1",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_02bk_fe597478-ab8e-491f-8864-4a9de460b82g",
        title: "​",
      },
    });
  });

  it("mixed token", async () => {
    const r = await handleUrl({
      url:
        "https://l.garyyang.work/?t=" +
        encodeURIComponent(
          "Hi {{name}}~姓{{name_last}}名{{name_short}}~{{name}}",
        ),
      fullMode: false,
      senderUserUnionId: "on_test_1",
      operatorUserUnionId: "on_test_0",
    });
    expect(r).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "Hi 大飞书~姓大名飞书~大飞书",
      },
    }); // on_test_0
  });

  it("image_key support hbs", async () => {
    // language=Handlebars
    let tpl = `{{#if (eq (time_now f="MM") "01")}}img_k1{{else}}img_k2{{/if}}`;

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?k=" +
        encodeURIComponent(
          // language=Handlebars
          tpl,
        ),
    });
    expect(r1.inline.image_key).toEqual("img_k1");

    jest.useFakeTimers().setSystemTime(new Date("2020-02-01"));
    const r2 = await handleUrl({
      url: "https://l.garyyang.work/?k=" + encodeURIComponent(tpl),
    });
    expect(r2.inline.image_key).toEqual("img_k2");
  });

  it("cp param", async () => {
    const r = await handleUrl({
      url: `https://l.garyyang.work/?t=Hi~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g&cp=${encodeURIComponent("https://example.com")}`,
      fullMode: false,
      senderUserUnionId: "1",
      operatorUserUnionId: "on_test_0",
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi~",
        url: {
          copy_url: "https://example.com",
        },
      },
    });
  });
});

describe("name", () => {
  it("{{name}} fallback - no user id", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=Hi%20%7B%7Bname%7D%7D~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
      fullMode: false,
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi LarkUser~",
      },
    });
  });

  it("{{name}} valid 1", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=Hi%20%7B%7Bname%7D%7D~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
      fullMode: false,
      senderUserUnionId: "on_test_0",
      operatorUserUnionId: "on_test_1",
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi test_1~",
      },
    }); // on_test_1
  });

  it("{{name}} valid 2", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=Hi%20%7B%7Bname%7D%7D~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
      fullMode: false,
      senderUserUnionId: "on_test_1",
      operatorUserUnionId: "on_test_0",
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi 大飞书~",
      },
    }); // on_test_0
  });

  it("{{name}} fallback - invalid both", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=Hi%20%7B%7Bname%7D%7D~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
      fullMode: false,
      senderUserUnionId: "1",
      operatorUserUnionId: "1",
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi LarkUser~",
      },
    });
  });
  it("{{name}} fallback - invalid operator", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=Hi%20%7B%7Bname%7D%7D~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
      fullMode: false,
      senderUserUnionId: "on_test_0",
      operatorUserUnionId: "1",
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi LarkUser~",
      },
    });
  });

  it("{{name}} fallback - invalid sender", async () => {
    const r = await handleUrl({
      url: "https://l.garyyang.work/?t=Hi%20%7B%7Bname%7D%7D~&k=img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
      fullMode: false,
      senderUserUnionId: "1",
      operatorUserUnionId: "on_test_0",
    });
    expect(r).toEqual({
      inline: {
        image_key: "img_v3_029v_3c667814-a576-4d76-8d1e-62e9b09af28g",
        title: "Hi LarkUser~",
      },
    });
  });
});

describe("time", () => {
  it("{{time_diff m='?' t='2013-03-01'}}", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?t=" +
        encodeURIComponent("{{time_diff m='from' t='2013-03-01'}}"),
    });
    expect(r1).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "2497",
      },
    });
    const r2 = await handleUrl({
      url:
        "https://l.garyyang.work/?t=" +
        encodeURIComponent("{{time_diff m='to' t='2013-03-01'}}"),
    });
    expect(r2).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "-2497",
      },
    });
    expect("-" + r1.inline.title).toEqual(r2.inline.title);
  });

  it("{{time_diff t='2014-03-01' f='s' tz='?'}}", async () => {
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?t=" +
        encodeURIComponent(
          "{{time_diff t='2014-03-01' f='s' tz='America/Toronto'}}",
        ),
    });
    expect(r1).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "184186800",
      },
    });
    const r2 = await handleUrl({
      url:
        "https://l.garyyang.work/?t=" +
        encodeURIComponent(
          "{{time_diff t='2014-03-01' f='s' tz='Asia/Shanghai'}}",
        ),
    });
    expect(r2).toEqual({
      inline: {
        image_key: defaultImageKey,
        title: "184233600",
      },
    });
    expect(r1).not.toStrictEqual(r2);
  });

  it("default timezone", async () => {
    // language=Handlebars
    let tpl = `{{time_now f="YYYY-MM-DD HH:mm:ss"}}|{{time_diff m='from' t='2020-01-01 00:00:00' f='m'}}|{{time_diff
                m='from' t='2020-01-01 00:00:00' f='m' tz='Etc/GMT-8'}}`;

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 00:00:00")); // utc+8 +2h
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?dtz=" +
        encodeURIComponent("Etc/GMT-10") +
        "&t=" +
        encodeURIComponent(
          // language=Handlebars
          tpl,
        ),
    });

    expect(r1.inline.title).toEqual("2020-01-01 02:00:00|120|0"); // 2h
  });

  it("bad default timezone", async () => {
    // language=Handlebars
    let tpl = `{{time_now f="YYYY-MM-DD HH:mm:ss"}}|{{time_diff m='from' t='2020-01-01 00:00:00' f='m'}}|{{time_diff
                m='from' t='2020-01-01 00:00:00' f='m' tz='Etc/GMT-8'}}`;

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 00:00:00")); // utc+8 +2h
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?dtz=" +
        encodeURIComponent("bad") +
        "&t=" +
        encodeURIComponent(
          // language=Handlebars
          tpl,
        ),
    });

    expect(r1.inline.title).toEqual(
      "RangeError: Invalid time zone specified: bad|RangeError: Invalid time zone specified: bad|0",
    ); // 2h
  });

  it("dbg_ct + timezone param", async () => {
    // language=Handlebars
    let tpl = `{{time_now f="YYYY-MM-DD HH:mm:ss"}}|{{time_diff m='from' t='2020-01-01 00:00:00' f='m'}}|{{time_diff
                m='from' t='2020-01-01 00:00:00' f='m' tz='Etc/GMT-8'}}`;

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 00:00:00"));
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?dtz=" +
        encodeURIComponent("Etc/GMT-10") +
        "&t=" +
        encodeURIComponent(
          // language=Handlebars
          tpl,
        ) +
        "&dbg_ct=" +
        encodeURIComponent("2020-01-03 00:00:00"),
    });

    expect(r1.inline.title).toEqual("2020-01-03 00:00:00|2880|2760"); // 48h
  });

  it("dbg_ct + bad dtz", async () => {
    // language=Handlebars
    let tpl = `{{time_diff m='from' t='2020-01-01 00:00:00' f='m'}}`;

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 00:00:00"));
    const r1 = await handleUrl({
      url:
        "https://l.garyyang.work/?dtz=" +
        encodeURIComponent("bad") +
        "&t=" +
        encodeURIComponent(
          // language=Handlebars
          tpl,
        ) +
        "&dbg_ct=" +
        encodeURIComponent("2020-01-03 00:00:00"),
    });

    expect(r1.inline.title).toEqual(
      "RangeError: Invalid time zone specified: bad",
    ); // 48h
  });
});
