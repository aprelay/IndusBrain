import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { simulateScenario } from "@/lib/superintel";

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const scenario = typeof body?.scenario === "string" ? body.scenario.trim().slice(0, 300) : "";
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const ideas = Array.isArray(body?.ideas)
    ? body.ideas
        .filter(
          (i: { name?: unknown; concept?: unknown }) =>
            typeof i?.name === "string" && typeof i?.concept === "string"
        )
        .slice(0, 5)
        .map((i: { name: string; concept: string; opportunityScore?: unknown }) => ({
          name: i.name.slice(0, 200),
          concept: i.concept.slice(0, 1000),
          opportunityScore: typeof i.opportunityScore === "number" ? i.opportunityScore : 0,
        }))
    : [];
  if (!scenario || ideas.length === 0) {
    return NextResponse.json({ error: "Requires 'scenario' and 'ideas'" }, { status: 400 });
  }
  const impacts = await simulateScenario(ideas, scenario, country || undefined);
  if (!impacts) {
    return NextResponse.json({ error: "Simulation unavailable" }, { status: 503 });
  }
  return NextResponse.json({ scenario, impacts });
}
