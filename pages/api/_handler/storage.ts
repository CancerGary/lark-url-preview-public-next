import { REDIS_KEY_PREFIX, ENABLE_REDIS } from "@/pages/api/_lib/config";
import { rdsGet, rdsSet } from "@/pages/api/_lib/redis";

export function buildCacheKey(prefix: string, key: string) {
  let cacheKey = `${REDIS_KEY_PREFIX ? REDIS_KEY_PREFIX : ""}${prefix}:${key}`;
  return cacheKey;
}
export function withRedisCache<P, T>(
  prefix: string,
  fn: (param: P) => Promise<T>,
  expireSecond?: number | (() => number),
  buildKey?: (param: P) => string,
) {
  return async function (param: P): Promise<T> {
    if (!ENABLE_REDIS) {
      return await fn(param);
    }

    let cacheKey = "";
    if (typeof param === "string") cacheKey = buildCacheKey(prefix, param);
    else cacheKey = buildCacheKey(prefix, buildKey?.(param) ?? String(param));

    let s = process.env.NODE_ENV !== "test" ? await rdsGet(cacheKey) : null;
    if (s) {
      let parse = JSON.parse(s);
      if (process.env.NODE_ENV === "development")
        console.log(
          "withRedisCache",
          cacheKey,
          s.length > 100 ? s.length : parse,
        );
      return parse;
    }
    let data = await fn(param);
    if (data && process.env.NODE_ENV !== "test") {
      if (typeof expireSecond === "function") {
        expireSecond = expireSecond();
      } else if (typeof expireSecond === "undefined") {
        expireSecond = 300;
      }
      await rdsSet(cacheKey, JSON.stringify(data), expireSecond);
      if (process.env.NODE_ENV === "development")
        console.log("writeRedisCache", cacheKey, data);
    }

    return data;
  };
}

export const LARK_UERR_INFO_PREFIX = "lark_user_info";

export type UserInfo = {
  name: string;
  email: string;
  unionId: string;
  employeeNo: string;
  employeeType: number;
  dgTenantName: string;
  dgTenantId: string;
  emailPrefix: string;
};

export const getUserInfo = withRedisCache(
  LARK_UERR_INFO_PREFIX,
  async function _getUserName(
    unionId: string,
  ): Promise<undefined | Partial<UserInfo>> {
    if (unionId === "on_test_0")
      return {
        name: "大飞书",
        email: "dafeishu@example.com",
        emailPrefix: "dafeishu",
        dgTenantId: "1",
        employeeNo: "123456",
      };
    if (unionId === "on_test_1")
      return {
        name: "test_1",
        email: "test_1@example.com",
        emailPrefix: "test_1",
        dgTenantId: "1",
        employeeNo: "654321",
      };
    return undefined;
  },
);
