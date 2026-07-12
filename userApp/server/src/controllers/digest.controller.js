import AppError from "../utils/appError.js";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const getDigest = async (req, res, next) => {
  try {
    const digestData = await redis.hgetall('news:latest');
    res.status(200).json({
      status: "success",
      data: digestData
    });
  } catch (error) {
    return next(new AppError(`Failed to fetch digest: ${error.message}`, 500));
  }
};
