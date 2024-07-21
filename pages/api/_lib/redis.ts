/* c8 ignore start */
import { ENABLE_REDIS, REDIS_HOST, REDIS_PASS } from "@/pages/api/_lib/config";
import IORedis from "ioredis";

type Ok = "OK";
const dbKey = {
  test: 1,
  development: 2,
  production: 6,
};

let redisClient: IORedis;
let redisClientReady: Promise<any>;

export async function initRedis() {
  if (!ENABLE_REDIS) return;

  redisClient = new IORedis({
    host: REDIS_HOST,
    password: REDIS_PASS,
    db: dbKey[process.env.NODE_ENV] ?? dbKey.development,
  });

  const i = await redisClient.ping();
  console.log("redis ping", i);
}

if (process.env.NODE_ENV !== "test") redisClientReady = initRedis();

export async function rdsSet(
  key: string,
  value: string,
  expireSecond?: number,
): Promise<Ok> {
  if (!ENABLE_REDIS) return "OK";
  await redisClientReady;

  if (expireSecond) {
    return redisClient.set(key, value, "EX", expireSecond);
  } else {
    return redisClient.set(key, value);
  }
}

export async function rdsGet(key: string): ReturnType<typeof redisClient.get> {
  if (!ENABLE_REDIS) return null;
  await redisClientReady;

  return redisClient.get(key);
}

export async function rdsLPush(
  key: string,
  value: string,
): ReturnType<typeof redisClient.lpush> {
  if (!ENABLE_REDIS) return 0;
  await redisClientReady;

  return redisClient.lpush(key, value);
}

export async function rdsLRange(
  key: string,
  start: number,
  end: number,
): ReturnType<typeof redisClient.lrange> {
  if (!ENABLE_REDIS) return [];
  await redisClientReady;

  return redisClient.lrange(key, start, end);
}

export async function rdsDel(key: string): ReturnType<typeof redisClient.del> {
  if (!ENABLE_REDIS) return 0;
  await redisClientReady;

  return redisClient.del(key);
}

export async function rdsDisconnect(): Promise<Ok> {
  if (!ENABLE_REDIS || !redisClient) return "OK";
  return redisClient.quit();
}
