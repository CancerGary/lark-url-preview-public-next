export const ENABLE_REDIS = false;
export const { REDIS_HOST, REDIS_PASS, REDIS_KEY_PREFIX } = {
  REDIS_HOST: "",
  REDIS_PASS: "",
  REDIS_KEY_PREFIX: "",
};

export const LARK_VERIFICATION_TOKEN = (
  process.env.LARK_VERIFICATION_TOKEN ?? ""
).split(",");

export const LARK_ENCRYPT_KEY = (process.env.LARK_APP_SECRET ?? "")!.split(",");

export const PROJECT_DOCX =
  "https://bcew4xxy7a.feishu.cn/docx/UpJkdVTdao7IwUx46bRcDiahn2D";
export const ICON_DOCX =
  "https://ituhdo1hkk.feishu.cn/docx/Lw0xdER0qoExN3xgP7Fc9AItnob";

export const SITE_TITLE = "自定义飞书链接预览";
export const EDITOR_TITLE = "自定义飞书链接预览编辑器";
