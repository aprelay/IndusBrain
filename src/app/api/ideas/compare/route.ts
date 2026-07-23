import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { compareJurisdictions } from "@/lib/superintel";

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const brief = typeof body?.brief === "string" ? body.brief.trim().slice(0, 500) : "";
  const jurisdictions = Array.isArray(body?.jurisdictions)
    ? body.jurisdictions
        .filter((j: unknown): j is string => typeof j === "string" && j.trim().length > 0)
        .map((j: string) => j.trim().slice(0, 60))
        .slice(0, 4)
    : [];
  if (!brief || jurisdictions.length < 2) {
    return NextResponse.json(
      { error: "Requires 'brief' and at least 2 'jurisdictions'" },
      { status: 400 }
    );
  }
  const result = await compareJurisdictions(brief, jurisdictions);
  if (!result) {
    return NextResponse.json({ error: "Comparison unavailable" }, { status: 503 });
  }
  return NextResponse.json(result);
}
