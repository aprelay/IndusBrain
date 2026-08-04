import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addUserCredits, consumeUserCredit } from "@/lib/db";
import { improveBusiness } from "@/lib/superintel";
import { clientIp, isRateLimited } from "@/lib/security";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  if (isRateLimited(`sme-improve:${clientIp(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "Too many requests, please wait a minute" }, { status: 429 });
  }
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const business = typeof body?.business === "string" ? body.business.trim().slice(0, 4000) : "";
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  if (business.length < 20) {
    return NextResponse.json(
      { error: "Describe your existing business in at least a sentence or two." },
      { status: 400 }
    );
  }
  const billingEnabled = process.env.BILLING_ENABLED === "true";
  const charged = billingEnabled && user.role !== "admin";
  if (charged && !consumeUserCredit(user.id)) {
    return NextResponse.json(
      { error: "A business improvement report costs 1 credit — please purchase credits.", creditsRequired: true },
      { status: 402 }
    );
  }
  const result = await improveBusiness(business, country || undefined);
  if (!result) {
    if (charged) addUserCredits(user.email, 1);
    return NextResponse.json({ error: "The Brain is unavailable right now" }, { status: 503 });
  }
  return NextResponse.json(result);
}
