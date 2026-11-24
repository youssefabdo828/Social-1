import type { RedisClientOptions } from "redis";
import envConfig from "./env.config";

export const redisConfig: RedisClientOptions = {
  url: envConfig.redis.url,
};