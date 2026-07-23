import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { askBrain } from "@/lib/superintel";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests, please wait a minute" }, { status: 429 });
  }
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in to ask the Brain.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 1000) : "";
  if (!question) {
    return NextResponse.json({ error: "Missing 'question' field" }, { status: 400 });
  }
  const history = Array.isArray(body?.history)
    ? body.history
        .filter(
          (m: { role?: unknown; content?: unknown }) =>
            (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
        )
        .map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content.slice(0, 2000),
        }))
    : [];
  const result = await askBrain(question, history);
  if (!result) {
    return NextResponse.json({ error: "The Brain is unavailable right now" }, { status: 503 });
  }
  return NextResponse.json(result);
}
