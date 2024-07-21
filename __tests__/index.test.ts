import { getServerSideProps } from "../pages/index";
import { ICON_DOCX } from "@/pages/api/_lib/config";

describe("landing index", () => {
  it("no url params", async () => {
    const r = await getServerSideProps({
      query: {},
      req: { headers: {} },
    } as any);

    expect(r).toStrictEqual({
      redirect: {
        destination: ICON_DOCX,
        permanent: false,
      },
    });
  });

  it("url params", async () => {
    const r = await getServerSideProps({
      query: { u: "https://baidu.com" },
      req: { headers: {} },
    } as any);

    expect(r).toStrictEqual({
      redirect: {
        destination: "https://baidu.com",
        permanent: false,
      },
    });
  });

  it("url params with template", async () => {
    const r = await getServerSideProps({
      query: {
        u: "https://baidu.com?r={{add 11 22}}",
      },
      req: { headers: {} },
    } as any);

    expect(r).toStrictEqual({
      redirect: {
        destination: "https://baidu.com?r=33",
        permanent: false,
      },
    });
  });
});
