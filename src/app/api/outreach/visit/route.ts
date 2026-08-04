import { NextRequest, NextResponse } from "next/server";
import { normalizeDomain } from "@/lib/outreach";
import { clientIp, isRateLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

const PROBE_TIMEOUT_MS = 4000;

async function probe(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IndusBrainBot/1.0)" },
    });
    clearTimeout(timer);
    if (res.ok || (res.status >= 300 && res.status < 500)) return true;
  } catch {
    // try next candidate
  }
  return false;
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(`visit:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const raw = req.nextUrl.searchParams.get("domain") || "";
  const domain = normalizeDomain(raw);
  if (!domain) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }
  const candidates = [
    `https://${domain}/`,
    `https://www.${domain}/`,
    `http://${domain}/`,
    `http://www.${domain}/`,
  ];
  for (const url of candidates) {
    if (await probe(url)) {
      return NextResponse.redirect(url, 302);
    }
  }
  // Nothing responded — send the visitor to the most likely address anyway
  return NextResponse.redirect(`https://www.${domain}/`, 302);
}
