import { NextRequest } from "next/server";

const buckets = new Map<string, number[]>();

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= max) {
    buckets.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  if (buckets.size > 50_000) buckets.clear();
  return false;
}

const dailyCounts = new Map<string, { day: string; count: number }>();

export function incrementDailyCount(key: string): number {
  const day = new Date().toISOString().slice(0, 10);
  const entry = dailyCounts.get(key);
  if (!entry || entry.day !== day) {
    dailyCounts.set(key, { day, count: 1 });
    if (dailyCounts.size > 50_000) {
      for (const [k, v] of Array.from(dailyCounts.entries())) {
        if (v.day !== day) dailyCounts.delete(k);
      }
    }
    return 1;
  }
  entry.count++;
  return entry.count;
}
