import { NextRequest, NextResponse } from "next/server";
import { searchOutreachDomains, outreachIndustryStats } from "@/lib/db";
import { OUTREACH_INDUSTRIES } from "@/lib/outreach";
import { getSessionUser } from "@/lib/auth";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { clientIp, isRateLimited, incrementDailyCount } from "@/lib/security";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;
const SEARCHES_PER_MINUTE = 30;
const FREE_PAGES_PER_DAY = 30;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  if (params.get("stats") === "1") {
    return NextResponse.json(outreachIndustryStats());
  }

  const ip = clientIp(req);
  if (isRateLimited(`outreach:${ip}`, SEARCHES_PER_MINUTE, 60_000)) {
    return NextResponse.json(
      { error: "Too many searches — please wait a minute." },
      { status: 429 }
    );
  }

  const isAdmin = isAdminAuthorized(req);
  const user = getSessionUser(req);
  if (!isAdmin && !user) {
    return NextResponse.json(
      { error: "Please sign in to search the outreach database.", signInRequired: true },
      { status: 401 }
    );
  }

  if (!isAdmin && user && user.credits <= 0) {
    const used = incrementDailyCount(`outreach-pages:${user.id}`);
    if (used > FREE_PAGES_PER_DAY) {
      return NextResponse.json(
        {
          error: `Daily browsing limit reached (${FREE_PAGES_PER_DAY} pages/day on the free plan). Purchase credits for unlimited browsing and exports.`,
        },
        { status: 429 }
      );
    }
  }

  const industry = params.get("industry")?.trim() || "";
  if (industry && !(OUTREACH_INDUSTRIES as readonly string[]).includes(industry)) {
    return NextResponse.json({ error: `Unknown industry '${industry}'` }, { status: 400 });
  }
  const query = (params.get("q") || "").trim().toLowerCase().slice(0, 100);
  const page = Math.max(1, Number(params.get("page")) || 1);
  const { total, domains } = searchOutreachDomains(industry, query, page, PER_PAGE);
  return NextResponse.json({
    total,
    page,
    perPage: PER_PAGE,
    pages: Math.max(1, Math.ceil(total / PER_PAGE)),
    domains,
  });
}
