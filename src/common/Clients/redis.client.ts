import { createClient } from "redis";
import { redisConfig } from "../../config/redis.config";


export const redisClient = createClient(redisConfig);

export const redisConnection = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};