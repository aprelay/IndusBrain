import { NextRequest, NextResponse } from "next/server";
import { listUnclassifiedDomains, markDomainsAiChecked, updateDomainIndustries } from "@/lib/db";
import { classifyDomain, classifyDomainsWithAI } from "@/lib/outreach";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const RUN_LIMIT = 400; // domains per run (keeps each request fast); click again to continue

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const useAI = req.nextUrl.searchParams.get("ai") !== "0";
  const domains = listUnclassifiedDomains(RUN_LIMIT);
  if (domains.length === 0) {
    return NextResponse.json({ processed: 0, reclassified: 0, remaining: 0 });
  }

  const updates: { domain: string; industry: string }[] = [];
  const stillUnknown: string[] = [];
  for (const d of domains) {
    const industry = classifyDomain(d);
    if (industry !== "unclassified") updates.push({ domain: d, industry });
    else stillUnknown.push(d);
  }

  let aiClassified = 0;
  if (useAI && stillUnknown.length > 0) {
    const aiResults = await classifyDomainsWithAI(stillUnknown);
    for (const [domain, industry] of Array.from(aiResults.entries())) {
      if (industry !== "unclassified") {
        updates.push({ domain, industry });
        aiClassified++;
      }
    }
  }

  const reclassified = updates.length > 0 ? updateDomainIndustries(updates) : 0;
  // Mark every processed domain so the next run moves on to fresh ones
  markDomainsAiChecked(domains);
  const moreBatches = domains.length === RUN_LIMIT;
  return NextResponse.json({
    processed: domains.length,
    reclassified,
    byKeywords: updates.length - aiClassified,
    byAI: aiClassified,
    remaining: moreBatches ? "yes — run again to continue" : 0,
  });
}
