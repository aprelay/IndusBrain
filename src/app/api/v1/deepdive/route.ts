import { NextRequest, NextResponse } from "next/server";
import { generateIdeaDeepDive } from "@/lib/ideas";
import { consumeApiKeyCredit, logBlueprintRequest } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Partner API: execution deep dive for one venture idea. Requires an
 * admin-issued API key via the `x-api-key` header; consumes one credit.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") || "";
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const ideaName = typeof body?.ideaName === "string" ? body.ideaName.trim().slice(0, 200) : "";
  const concept = typeof body?.concept === "string" ? body.concept.trim().slice(0, 2000) : "";
  if (!ideaName || !concept) {
    return NextResponse.json({ error: "Requires 'ideaName' and 'concept'" }, { status: 400 });
  }
  if (!consumeApiKeyCredit(apiKey)) {
    return NextResponse.json(
      { error: "Invalid API key or no credits remaining" },
      { status: 402 }
    );
  }
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const brief = typeof body?.brief === "string" ? body.brief.trim().slice(0, 500) : "";
  const deepDive = await generateIdeaDeepDive(
    ideaName,
    concept,
    country || undefined,
    brief || undefined
  );
  if (!deepDive) {
    return NextResponse.json({ error: "Deep dive engine unavailable" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "api";
  logBlueprintRequest({ request: ideaName, industry: "Deep Dive", source: "api:deepdive", ip });
  return NextResponse.json(deepDive);
}
