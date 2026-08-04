import { NextRequest, NextResponse } from "next/server";
import {
  listUnclassifiedDomains,
  markDomainsAiChecked,
  resetAiChecked,
  updateDomainIndustries,
} from "@/lib/db";
import { classifyDomain, classifyDomainsByWebsite } from "@/lib/outreach";
import { auditAdminAction, isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const RUN_LIMIT = 200; // domains per run (keeps each request fast); click again to continue

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  auditAdminAction(req, "outreach reclassify run");
  if (req.nextUrl.searchParams.get("reset") === "1") {
    resetAiChecked();
  }
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

  let siteClassified = 0;
  let siteAttempted: string[] = [];
  if (stillUnknown.length > 0) {
    const { results, attempted } = await classifyDomainsByWebsite(stillUnknown);
    siteAttempted = attempted;
    for (const [domain, industry] of Array.from(results.entries())) {
      if (industry !== "unclassified") {
        updates.push({ domain, industry });
        siteClassified++;
      }
    }
  }

  const reclassified = updates.length > 0 ? updateDomainIndustries(updates) : 0;
  // Mark processed domains so the next run moves on to fresh ones
  markDomainsAiChecked([...updates.map((u) => u.domain), ...siteAttempted]);
  const moreBatches = domains.length === RUN_LIMIT;
  return NextResponse.json({
    processed: domains.length,
    reclassified,
    byKeywords: updates.length - siteClassified,
    byWebsite: siteClassified,
    remaining: moreBatches ? "yes — run again to continue" : 0,
  });
}
