import { NextRequest, NextResponse } from "next/server";
import { searchOutreachDomains, outreachIndustryStats } from "@/lib/db";
import { OUTREACH_INDUSTRIES } from "@/lib/outreach";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  if (params.get("stats") === "1") {
    return NextResponse.json(outreachIndustryStats());
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
