import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { enrichOutreachDomain, getOutreachEnrichment } from "@/lib/db";
import { fetchDomainEnrichment } from "@/lib/superintel";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;
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
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const domain =
    typeof body?.domain === "string" ? body.domain.trim().toLowerCase().slice(0, 200) : "";
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "Requires a valid 'domain'" }, { status: 400 });
  }
  const existing = getOutreachEnrichment(domain);
  if (existing === null) {
    return NextResponse.json({ error: "Domain not in the Outreach database" }, { status: 404 });
  }
  if (existing.enrichedAt) {
    return NextResponse.json({ domain, ...existing, cached: true });
  }
  const data = await fetchDomainEnrichment(domain);
  if (!data) {
    return NextResponse.json({ error: "Website unreachable — could not enrich" }, { status: 502 });
  }
  enrichOutreachDomain(domain, data);
  return NextResponse.json({ domain, ...data, cached: false });
}
