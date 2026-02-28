import type { NextRequest } from "next/server";
import { getRedisClient } from "@/lib/db";

const RATE_LIMIT_WINDOW_SEC = 60 * 60; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20; // max AI calls per IP per hour
const KEY_PREFIX = "ratelimit:ai:";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || real?.trim() || "unknown";
  return ip;
}

function rateLimitKey(ip: string): string {
  const hour = Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SEC * 1000));
  return `${KEY_PREFIX}${ip}:${hour}`;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  current: number;
  limit: number;
}

/**
 * Check and consume one AI request for the given IP.
 * Uses Redis fixed 1-hour window. When Redis is unavailable, allows the request.
 */
export async function checkAndConsumeAiRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  const limit = RATE_LIMIT_MAX_REQUESTS;
  try {
    const redis = await getRedisClient();
    const key = rateLimitKey(ip);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SEC);
    }
    const ttl = await redis.ttl(key);
    const allowed = count <= limit;
    const retryAfter = allowed
      ? undefined
      : ttl > 0
        ? ttl
        : RATE_LIMIT_WINDOW_SEC;
    return {
      allowed,
      retryAfter: allowed ? undefined : retryAfter,
      current: count,
      limit,
    };
  } catch {
    return { allowed: true, current: 0, limit };
  }
}
