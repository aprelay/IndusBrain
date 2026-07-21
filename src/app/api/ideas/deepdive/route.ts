import { NextRequest, NextResponse } from "next/server";
import { generateIdeaDeepDive } from "@/lib/ideas";
import { consumeCredit, consumeUserCredit, logBlueprintRequest, saveIdeaReport } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { clientIp, isRateLimited } from "@/lib/security";

const MAX_FIELD_LENGTH = 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(`deepdive:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests, please wait a minute" },
      { status: 429 }
    );
  }
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to use the Idea Engine.", signInRequired: true },
      { status: 401 }
    );
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, MAX_FIELD_LENGTH) : "";
  const concept = typeof body?.concept === "string" ? body.concept.trim().slice(0, MAX_FIELD_LENGTH) : "";
  if (!name || !concept) {
    return NextResponse.json({ error: "Missing idea name or concept" }, { status: 400 });
  }
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const brief = typeof body?.brief === "string" ? body.brief.trim().slice(0, MAX_FIELD_LENGTH) : "";

  const billingEnabled = process.env.BILLING_ENABLED === "true";
  if (billingEnabled) {
    const accessCode = typeof body?.accessCode === "string" ? body.accessCode.trim() : "";
    const unlocked =
      user.role === "admin" ||
      consumeUserCredit(user.id) ||
      (accessCode !== "" && consumeCredit(accessCode));
    if (!unlocked) {
      return NextResponse.json(
        {
          error: "An execution deep dive costs 1 credit. Request a quote to buy credits.",
          creditsRequired: true,
        },
        { status: 402 }
      );
    }
  }

  const deepDive = await generateIdeaDeepDive(
    name,
    concept,
    country || undefined,
    brief || undefined
  );
  if (!deepDive) {
    return NextResponse.json(
      { error: "Deep dive unavailable — AI is not configured or the request failed" },
      { status: 503 }
    );
  }
  logBlueprintRequest({
    request: `Deep dive: ${name}`,
    industry: "Idea Engine",
    source: "ideas-deepdive",
    ip,
  });
  saveIdeaReport(user.id, `Deep dive: ${name.slice(0, 80)}`, JSON.stringify(deepDive));
  return NextResponse.json(deepDive);
}
