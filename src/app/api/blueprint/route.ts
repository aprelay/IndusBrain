import { NextRequest, NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/generate";

const MAX_REQUEST_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests, please wait a minute" },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => null);
  const request = typeof body?.request === "string" ? body.request.trim() : "";
  if (!request) {
    return NextResponse.json({ error: "Missing 'request' field" }, { status: 400 });
  }
  if (request.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json(
      { error: `Request too long (max ${MAX_REQUEST_LENGTH} characters)` },
      { status: 400 }
    );
  }
  const blueprint = await generateBlueprint(request);
  return NextResponse.json(blueprint);
}
