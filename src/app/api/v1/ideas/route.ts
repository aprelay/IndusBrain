import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/ideas";
import { consumeApiKeyCredit, logBlueprintRequest } from "@/lib/db";
import { rememberIdeaReport } from "@/lib/brain";
import { computeOpportunityScore } from "@/lib/intelligence";
import { buildFullContext } from "@/lib/superintel";

export const dynamic = "force-dynamic";

const MAX_REQUEST_LENGTH = 500;

/**
 * Partner API: venture idea generation. Requires an admin-issued API key via
 * the `x-api-key` header; each successful call consumes one API-key credit.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") || "";
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const brief = typeof body?.brief === "string" ? body.brief.trim() : "";
  if (!brief) {
    return NextResponse.json({ error: "Missing 'brief' field" }, { status: 400 });
  }
  if (brief.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json(
      { error: `Brief too long (max ${MAX_REQUEST_LENGTH} characters)` },
      { status: 400 }
    );
  }
  if (!consumeApiKeyCredit(apiKey)) {
    return NextResponse.json(
      { error: "Invalid API key or no credits remaining" },
      { status: 402 }
    );
  }
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const grounding = buildFullContext(brief, country || undefined);
  const report = await generateIdeas(brief, country || undefined, grounding.context || undefined);
  if (!report) {
    return NextResponse.json({ error: "Idea Engine unavailable" }, { status: 503 });
  }
  report.ideas = report.ideas.map((i) => ({
    ...i,
    opportunityScore: computeOpportunityScore(i, brief),
  }));
  report.groundedIn = grounding.citations;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "api";
  logBlueprintRequest({ request: brief, industry: "Idea Engine", source: "api:ideas", ip });
  rememberIdeaReport(report);
  return NextResponse.json(report);
}
