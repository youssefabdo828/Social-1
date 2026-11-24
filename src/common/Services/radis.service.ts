import { RedisArgument, SetOptions } from "redis";
import { redisClient } from "../Clients/redis.client";



class RedisService {
   get = async (key: RedisArgument): Promise<string | null> => {
  return redisClient.get(key);
};

 del = async (key: RedisArgument): Promise<number> => {
  return redisClient.del(key);
};

 set = async ({
  key,
  value,
  options = {},
}: {
  key: RedisArgument;
  value: string | number;
  options?: SetOptions;
}) => {
  return redisClient.set(key, value, options);
};

 TTL = async (key: RedisArgument): Promise<number> => {
  return redisClient.ttl(key);
};

 expire = async (key: RedisArgument, expiresIn: number) => {
  return redisClient.expire(key, expiresIn);
};

 calculateTTL = (expiration: number): number => {
  const now = Math.floor(Date.now() / 1000);
  return expiration - now;
};
}


export default RedisService;