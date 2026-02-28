import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

type RedisClient = ReturnType<typeof createClient>;
let client: RedisClient | null = null;

async function getClient(): Promise<RedisClient> {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not set");
  }
  if (client?.isOpen) return client;
  if (client) {
    await client.connect();
    return client;
  }
  const newClient = createClient({ url: REDIS_URL }).on("error", (err) =>
    console.error("[Redis]", err),
  );
  await newClient.connect();
  client = newClient;
  return client;
}

const KEY_ANALYSES = "stats:analyses";
const KEY_RATINGS_COUNT = "stats:ratings:count";
const KEY_RATINGS_SUM = "stats:ratings:sum";
const KEY_RATINGS_POSITIVE = "stats:ratings:positive";

export interface Stats {
  totalAnalyses: number;
  totalRatings: number;
  averageRating: number;
  positiveCount: number;
}

function parseNum(val: string | null): number {
  if (val == null || val === "") return 0;
  const n = Number.parseInt(val, 10);
  return Number.isNaN(n) ? 0 : n;
}

export async function getStats(): Promise<Stats> {
  const redis = await getClient();
  const [analyses, count, sum, positive] = await redis.mGet([
    KEY_ANALYSES,
    KEY_RATINGS_COUNT,
    KEY_RATINGS_SUM,
    KEY_RATINGS_POSITIVE,
  ]);
  const totalAnalyses = parseNum(analyses);
  const totalRatings = parseNum(count);
  const sumNum = parseNum(sum);
  const averageRating =
    totalRatings > 0 ? Number((sumNum / totalRatings).toFixed(1)) : 0;
  const positiveCount = parseNum(positive);
  return {
    totalAnalyses,
    totalRatings,
    averageRating,
    positiveCount,
  };
}

export async function recordAnalysis(): Promise<void> {
  const redis = await getClient();
  await redis.incr(KEY_ANALYSES);
}

export async function recordRating(score: number): Promise<void> {
  if (score < 1 || score > 5) return;
  const redis = await getClient();
  const multi = redis
    .multi()
    .incr(KEY_RATINGS_COUNT)
    .incrBy(KEY_RATINGS_SUM, score);
  if (score >= 4) {
    multi.incr(KEY_RATINGS_POSITIVE);
  }
  await multi.exec();
}
